const MONGOOSE = require('mongoose');


// const OTP_STORE_SCHEMA = require('../models/otp_store');
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

const OTP_GENERATOR = () => {
    let otp;
    do {
        otp = (Math.floor(1000 + Math.random() * 9000)).toString();
    } while (otp.length != 4);
    return otp;
}

// ? Authenticate aadhar number and send OTP
exports.authenticate_aadhar = (req, res) => {
    if (!req.body.aadharNumber || typeof req.body.aadharNumber != 'string' || req.body.aadharNumber.trim().length != 12 || !ONLY_NUMBER_VALIDATOR.test(req.body.aadharNumber)) {
        res.send(res_generator(req.body, true, 'Invalid aadhar number'));
    } else {
        const AADHAR = req.body.aadharNumber;
        AADHAR_SCHEMA.find({ aadharNumber: AADHAR })
            .then(result => {
                if (result.length === 0) {
                    res.send(res_generator(req.body, true, `No record found with ${AADHAR}`));
                } else {
                    var ORIGINAL_AADHAR = result[0]._doc;
                    delete ORIGINAL_AADHAR._id;
                    delete ORIGINAL_AADHAR.__v;
                    CITIZEN_SCHEMA.find({ aadharNumber: AADHAR })
                        .then(result => {
                            if (result.length === 0) {
                                const email = decrypt_string(ORIGINAL_AADHAR.email);
                                const OTP = OTP_GENERATOR();
                                // console.log(OTP)
                                send_mail(
                                    email,
                                    "OTP verification for Registration at Online Requisition portal - Gujarat",
                                    `Your One Time Password is : ${OTP}`,
                                    'Please do not share this OTP.'
                                )
                                const ENC_OTP = encrypt_string(OTP);
                                res.send(res_generator({ otp: ENC_OTP, aadhar: ORIGINAL_AADHAR }, false, 'OTP sent to the linked email with aadhar'));
                            } else {
                                res.send(res_generator(req.body, true, "Already registered with this aadhar number"))
                            }
                        })


                }
            })
    }
}
exports.verify_otp_for_aadhar = (req, res) => {
    if (
        !req.body.otp
        || !req.body.aadhar
        || !req.body.clientOtp

        || typeof req.body.otp != 'string'
        || typeof req.body.clientOtp != 'string'
        || typeof req.body.aadhar != 'object'

        || !ONLY_NUMBER_VALIDATOR.test(req.body.clientOtp)

        || req.body.clientOtp.trim().length !== 4
    ) {
        res.send(res_generator(req.body, true, "Bad request"));
    } else {
        const DATA = req.body;
        const SERVER_OTP = decrypt_string(DATA.otp);
        if (SERVER_OTP === DATA.clientOtp) {
            const my_aadhar = {}
            for (var field in DATA.aadhar) {
                if (field === 'aadharNumber') {
                    continue;
                } else {
                    // console.log("--------------------------")
                    // console.log(my_aadhar[field]);
                    my_aadhar[field] = decrypt_string(DATA.aadhar[field]);
                    // console.log(my_aadhar[field]);

                }
            }
            res.send(res_generator(my_aadhar, false, "Verified"));
        } else {
            res.send(res_generator(DATA, true, "Invalid OTP"));
        }
    }
}
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
                    if (result.length === 0) {
                        res.send(res_generator(DATA, true, `No record found with ${DATA.aadharNumber}`));
                    } else {
                        // ! Process of registration after finding the citizen in aadhar database
                        CITIZEN_SCHEMA.find({ $or: [{ email: DATA.email }, { aadharNumber: DATA.aadharNumber }] })
                            .then(data => {
                                if (data.length === 0) {
                                    const CITIZEN = {
                                        aadharNumber: DATA.aadharNumber,
                                        email: encrypt_string(DATA.email),
                                        password: bcrypt_password(DATA.password)
                                    }
                                    const TO_BE_SAVED = new CITIZEN_SCHEMA(CITIZEN)
                                    TO_BE_SAVED.save()
                                        .then(() => {
                                            send_mail(
                                                DATA.email,
                                                "Registration successful on Online Requisition portal - Gujarat",
                                                `Now you can use services like issuing birth,death and marriage certificate online.`,
                                                'Please do not share credentials and if it was not you please reply us to this email'
                                            )
                                            res.send(res_generator(DATA.email, false, 'Registration successful'));
                                        })
                                        .catch(err => {
                                            error_printer('Saving the new citizen', err);
                                            res.send(res_generator({ email: DATA.email }, true, "Server side error"));
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


// ? Citizen Services 
exports.aadhar_verification = (req, res) => {
    if (!req.body.aadharNumber || typeof req.body.aadharNumber != 'string' || req.body.aadharNumber.trim().length != 12 || !ONLY_NUMBER_VALIDATOR.test(req.body.aadharNumber)) {
        res.send(res_generator(req.body, true, 'Invalid aadhar number'));
    } else {
        const AADHAR = req.body.aadharNumber;
        AADHAR_SCHEMA.find({ aadharNumber: AADHAR })
            .then(result => {
                if (result.length === 0) {
                    res.send(res_generator(req.body, true, `No record found with ${AADHAR}`));
                } else {
                    var ORIGINAL_AADHAR = result[0]._doc;
                    delete ORIGINAL_AADHAR._id;
                    delete ORIGINAL_AADHAR.__v;
                    const email = decrypt_string(ORIGINAL_AADHAR.email);
                    const OTP = OTP_GENERATOR();
                    console.log(OTP)
                    // send_mail(
                    //     email,
                    //     "OTP verification for Registration at Online Requisition portal - Gujarat",
                    //     `Your One Time Password is : ${OTP}`,
                    //     'Please do not share this OTP.'
                    // )
                    const ENC_OTP = encrypt_string(OTP);
                    res.send(res_generator({ otp: ENC_OTP, aadhar: ORIGINAL_AADHAR }, false, 'OTP sent to the linked email with aadhar'));
                }
            })
    }
}