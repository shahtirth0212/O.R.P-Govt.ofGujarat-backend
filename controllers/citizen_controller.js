const OTP_STORE_SCHEMA = require('../models/otp_store');
const AADHAR_SCHEMA = require('../models/aadhar_model');
const CITIZEN_SCHEMA = require('../models/citizen/citizen_model');

const { res_generator } = require('../helpers/response_generator');
const { error_printer } = require('../helpers/error_printer');
const { send_mail } = require('../helpers/services/mail_services');
const { bcrypt_password, authenticate_password } = require("../helpers/password_bcrypt");
const { encrypt_string, decrypt_string } = require('../helpers/ecry_dcry_aadhar');
const { generate_token } = require('../helpers/services/token_services');

const PASSWORD_VALIDATOR = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;
// const MOBILE_VALIDATOR = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
const EMAIL_VALIDATOR = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const ONLY_NUMBER_VALIDATOR = new RegExp('^[0-9]+$');


// ? Register a citizen
exports.register_citizen = (req, res) => {
    if (
        !req.body.aadharNumber
        // || !req.body.mobile
        || !req.body.email
        || !req.body.password
    ) {
        res.send(res_generator(req.body, true, 'Insufficient data provided for registration'));
    }
    else {
        const DATA = {
            aadharNumber: req.body.aadharNumber, email: req.body.email,
            password: req.body.password
        };
        if (// Validate incoming  data type
            typeof DATA['aadharNumber'] !== "string"
            // || typeof DATA['mobile'] !== "string"
            || typeof DATA['email'] !== "string"
            || typeof DATA['password'] !== "string"
            // Validate incoming  data 
            || DATA.aadharNumber.trim().length != 12
            || !ONLY_NUMBER_VALIDATOR.test(DATA.aadharNumber)
            // || !MOBILE_VALIDATOR.test(DATA.mobile)
            || !EMAIL_VALIDATOR.test(DATA.email)
            || !PASSWORD_VALIDATOR.test(DATA.password)
        ) {
            res.send(res_generator(req.body, true, 'Invalid data provided for registration'));
        }
        // All incoming data is valid 
        else {
            AADHAR_SCHEMA.find({ aadharNumber: DATA.aadharNumber })
                .then(result => {
                    if (result.length == 0) {
                        res.send(res_generator(DATA, true, `No record found with ${DATA.aadharNumber}`));
                    } else {
                        // ! Process of registration after finding the citizen in aadhar database
                        CITIZEN_SCHEMA.find({ $or: [{ email: DATA.email }, { aadharNumber: DATA.aadharNumber }] })
                            .then(data => {
                                if (data.length === 0) {
                                    let otp;
                                    do {
                                        otp = (Math.floor(1000 + Math.random() * 9000)).toString();
                                    } while (otp.length != 4);
                                    // ! Store OTP and email to the database
                                    OTP_STORE_SCHEMA.findOne({ email: DATA.email })
                                        .then((citizen) => {
                                            if (citizen == null) {
                                                const password = bcrypt_password(DATA.password);
                                                const ENC = {
                                                    otp,
                                                    email: DATA.email,
                                                    aadharNumber: DATA.aadharNumber,
                                                    password
                                                };
                                                const TO_BE_SAVED = new OTP_STORE_SCHEMA(ENC);
                                                TO_BE_SAVED.save()
                                                    .then(() => {
                                                        send_mail(
                                                            DATA.email,
                                                            "OTP verification for Registration at Online Requisition portal - Gujarat",
                                                            `Your One Time Password is : ${otp}`,
                                                            'Please do not share this OTP.'
                                                        )
                                                        res.send(res_generator(DATA.email, false, 'OTP sent for authentication, OTP is valid for 5 minutes only'));
                                                        setTimeout(() => {
                                                            // ! Delete OTP from Database after 5 minutes
                                                            OTP_STORE_SCHEMA.deleteOne({ email: DATA.email })
                                                                .then(() => {
                                                                    // console.log('Record deleted')
                                                                });
                                                        }, 300000);
                                                        // 300000
                                                    })
                                                    .catch(err => {
                                                        res.send(res_generator(DATA, true, 'Server side error, Please try again later'));
                                                        error_printer('At saving the OTP', err);
                                                    })
                                            } else {
                                                res.send(res_generator(DATA, true, "You have already requested an OTP, Please wait for 5 minutes"))
                                            }
                                        })
                                        .catch(err => {
                                            res.send(res_generator(DATA, true, 'Server side error, Please try again later'));
                                            error_printer('At finding existing OTP', err);
                                        })
                                } else {
                                    res.send(res_generator(DATA, true, "Already registered with this aadhar number or email"))
                                }
                            })
                            .catch(err => {
                                res.send(res_generator(DATA, true, 'Server side error, Please try again later'));
                                error_printer('Finding the existing citizen', err);
                            })
                    }
                })
                .catch(err => {
                    res.send(res_generator(DATA, true, 'Server side error, Please try again later'));
                    error_printer('At Finding the aadhar for citizen', err);
                })
        }
    }
}
// ? OTP verification at registration of a citizen
exports.verify_citizen_otp = (req, res) => {
    if (
        !req.body.email
        || !req.body.otp
        || typeof req.body.email != 'string'
        || typeof req.body.otp != 'string'
        || !EMAIL_VALIDATOR.test(req.body.email)
        || !ONLY_NUMBER_VALIDATOR.test(req.body.otp)
    ) {
        res.send(res_generator(req.body, true, 'Insufficient or Invalid data provided'));
    } else {
        const DATA = { email: req.body.email, otp: req.body.otp }
        OTP_STORE_SCHEMA.findOne({ email: req.body.email })
            .then((citizen) => {
                if (citizen == null) {
                    res.send(res_generator(req.body, true, "Server side error, Please try again"));
                } else {
                    if (citizen.otp === DATA.otp) {
                        const email = encrypt_string(citizen.email);
                        const new_citizen = {
                            email,
                            password: citizen.password,
                            aadharNumber: citizen.aadharNumber,
                            appliedFor: [],
                            drafts: []
                        };
                        const TO_BE_SAVED = new CITIZEN_SCHEMA(new_citizen);
                        TO_BE_SAVED.save()
                            .then(() => {
                                res.send(res_generator({ email: req.body.email }, false, "Register successful"))
                            })
                            .catch(err => {
                                res.send(res_generator(req.body, true, "Server side error, Please try again"));
                                error_printer('Saving the new citizen', err);
                            })
                    } else {
                        res.send(res_generator(DATA, true, "Invalid OTP"));
                    }
                }
            })
            .catch(err => {
                res.send(res_generator(req.body, true, "Server side error, Please try again"));
                error_printer('Finding otp for verification at citizen register', err);
            })
    }
}


// ? Login a citizen
exports.login_citizen = (req, res) => {
    if (
        !req.body.aadharNumber
        || !req.body.password
        || typeof req.body.aadharNumber != 'string'
        || typeof req.body.password != 'string'
        || req.body.aadharNumber.trim().length != 12
        || !ONLY_NUMBER_VALIDATOR.test(req.body.aadharNumber)
        || !PASSWORD_VALIDATOR.test(req.body.password)
    ) {
        res.send(res_generator(req.body, true, 'Insufficient or Invalid data provided'));
    } else {
        const DATA = { aadharNumber: req.body.aadharNumber, password: req.body.password };
        CITIZEN_SCHEMA.findOne({ aadharNumber: DATA.aadharNumber })
            .then(user => {
                if (user === null) {
                    res.send(res_generator(DATA, true, "No account found"));
                } else {
                    if (!authenticate_password(DATA.password, { password: user.password })) {
                        res.send(res_generator(DATA, true, "Aadhar number and password combinations are invalid"));
                    } else {
                        const email = decrypt_string(user.email);
                        const CITIZEN = {
                            _id: user._id,
                            email,
                            aadharNumber: DATA.aadharNumber,
                            appliedFor: user.appliedFor,
                            drafts: user.drafts
                        };
                        const token = generate_token(CITIZEN);
                        CITIZEN.token = token;
                        res.send(res_generator(CITIZEN, false, 'Login successful'));
                    }
                }
            })
            .catch(err => {
                res.send(res_generator(DATA, true, "Server side error, Please try again"));
                error_printer('Finding the citizen for login', err);
            });
    }
}