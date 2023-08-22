const MONGOOSE = require('mongoose');

// const OTP_STORE_SCHEMA = require('../models/otp_store');
const AADHAR_SCHEMA = require('../models/aadhar_model');
const DISTRICTS_SCHEMA = require("../models/district_model");
const CITIZEN_SCHEMA = require('../models/citizen/citizen_model');
const CERTIFICATES_SCHEMA = require("../models/certificates/certificate_model");
const APPLIED_CERTIFICATE_SCHEMA = require("../models/certificates/applied_certificates");
const SLOTS_INFORMATION = require("../models/verification_slots/slots_info_model");
const SLOTS_SCHEMA = require("../models/verification_slots/slots_model");
const BIRTH_FORM_SCHEMA = require("../models/certificate_forms/birth_certificate_form");
const MARRIAGE_FORM_SCHEMA = require("../models/certificate_forms/marriage_certificate_form");
const DEATH_SCHEMA = require("../models/certificate_forms/death_certificate_form");
const CLERK_SCHEMA = require("../models/authorities/clerk_model");

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

// ? Authenticate aadhar number and send OTP for citizen and clerk registration
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
                    if (req.body.clerk) {
                        CLERK_SCHEMA.findOne({ aadharNumber: AADHAR })
                            .then(result => {
                                if (result) {
                                    res.send(res_generator(req.body, true, "Already registered with this aadhar number"))
                                } else {
                                    const email = decrypt_string(ORIGINAL_AADHAR.email);
                                    const OTP = OTP_GENERATOR();
                                    console.log(OTP)
                                    send_mail(
                                        email,
                                        "OTP verification for Registration at Online Requisition portal - Gujarat",
                                        `Your One Time Password is : ${OTP}`,
                                        'Please do not share this OTP.'
                                    )
                                    const ENC_OTP = encrypt_string(OTP);
                                    res.send(res_generator({ otp: ENC_OTP, aadhar: ORIGINAL_AADHAR }, false, 'OTP sent to the linked email with aadhar'));
                                }
                            })
                    } else {
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
                    my_aadhar[field] = DATA.aadhar[field];
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
// ? Submit birth Form
// ! Can throw error
exports.submit_birth_form = async (req, res) => {
    const DATA = req.body;
    if (
        !DATA.childBirthDate ||
        !DATA.childGender ||
        !DATA.childFirstName ||
        !DATA.childMiddleName ||
        !DATA.childLastName ||
        !DATA.childWeight ||
        !DATA.placeOfBirth ||
        !DATA.motherAadhar ||
        !DATA.motherReligion ||
        !DATA.motherLiteracy ||
        !DATA.motherAgeAtBirth ||
        !DATA.motherOccupation ||
        !DATA.fatherAadhar ||
        !DATA.fatherReligion ||
        !DATA.fatherLiteracy ||
        !DATA.fatherOccupation ||
        !DATA.postDeliveryTreatment ||
        !DATA.deliveryType ||
        !DATA.pregnancyDurationWeeks ||
        !DATA.permanentAddProofDOC ||
        !DATA.marriageCertificateDOC ||
        !DATA.proofOfBirthDOC ||
        !DATA.appliedBy
    ) {
        res.send(res_generator(req.body, true, "Insufficient data provided"));
    } else {
        let FORM = req.body;
        let BIRTH_FORM = {};
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: FORM.placeOfBirth });
        // FORM.placeOfBirth = new MONGOOSE.Types.ObjectId(DISTRICT._id)
        FORM.placeOfBirth = DISTRICT._id;

        CERTIFICATES_SCHEMA.findOne({ certi: 0 })
            .then(result => {
                BIRTH_FORM = result;
                FORM.certificateId = BIRTH_FORM._id;
                FORM.path = "";
                const TO_BE_SAVED = new BIRTH_FORM_SCHEMA(FORM);
                let SAVED_FORM;
                TO_BE_SAVED.save()
                    .then(result => {
                        SAVED_FORM = result;
                        const APPLIED_CERTIFICATE = {
                            certificateId: BIRTH_FORM._id,
                            formId: SAVED_FORM._id,
                            district: DISTRICT._id,
                            certificateNumber: "",
                            issued: false,
                            verified: false,
                            appliedBy: FORM.appliedBy,
                            holders: [{ firstName: SAVED_FORM.childFirstName, middleName: SAVED_FORM.childMiddleName, lastName: SAVED_FORM.childLastName }]
                        }
                        const TO_BE_SAVED = APPLIED_CERTIFICATE_SCHEMA(APPLIED_CERTIFICATE);
                        TO_BE_SAVED.save()
                            .then(result => {
                                const APPLIED_CERTIFICATE = result;
                                BIRTH_FORM_SCHEMA.updateOne({ _id: SAVED_FORM._id }, { $set: { appliedCertificateId: APPLIED_CERTIFICATE._id } })
                                    .then(result => {
                                        CITIZEN_SCHEMA.updateOne({ _id: FORM.appliedBy }, { $push: { appliedFor: APPLIED_CERTIFICATE._id } })
                                            .then(() => {
                                                res.send(res_generator({ appliedFor: APPLIED_CERTIFICATE._id }, false, "Form Submitted"))
                                            })
                                            .catch(err => {
                                                console.log(err)
                                                res.send(res_generator(req.body, true, "Server side error"));
                                            })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        res.send(res_generator(req.body, true, "Server side error"));
                                    })
                            })
                            .catch(err => {
                                console.log(err)
                                res.send(res_generator(req.body, true, "Server side error"));
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        res.send(res_generator(req.body, true, "Server side error"));
                    });
            })
            .catch(err => {
                res.send(res_generator(req.body, true, "Server side error"));
                console.log(err)
            })
    }
}
// ? Submit Marriage Form
// ! Can throw error
exports.submit_marriage_form = async (req, res) => {
    const DATA = req.body;
    if (!DATA.dateOfMarriage ||
        !DATA.placeOfMarriage ||
        !DATA.district ||

        !DATA.husbandAadhar ||
        !DATA.husbandName ||
        !DATA.husbandReligion ||
        !DATA.husbandStatus ||
        !DATA.husbandBirth ||
        !DATA.husbandSign ||

        !DATA.wifeAadhar ||
        !DATA.wifeName ||
        !DATA.wifeReligion ||
        !DATA.wifeStatus ||
        !DATA.wifeBirth ||
        !DATA.wifeSign ||

        !DATA.witness1FullName ||
        !DATA.witness1Address ||
        !DATA.witness1ID ||
        !DATA.witness1Sign ||

        !DATA.witness2FullName ||
        !DATA.witness2Address ||
        !DATA.witness2ID ||
        !DATA.witness2Sign ||

        !DATA.priestSign ||
        !DATA.marriagePhoto1 ||
        !DATA.marriagePhoto2 ||
        !DATA.appliedBy
    ) {
        res.send(res_generator(req.body, true, "Insufficient data provided"));
    } else {
        const DATA = req.body;
        let FORM = {
            dateOfMarriage: DATA.dateOfMarriage,
            placeOfMarriage: DATA.placeOfMarriage,
            district: DATA.district,
            husbandAadhar: DATA.husbandAadhar,
            husbandReligion: DATA.husbandReligion,
            husbandStatus: DATA.husbandStatus,
            husbandBirth: DATA.husbandBirth,
            husbandSign: DATA.husbandSign,
            wifeAadhar: DATA.wifeAadhar,
            wifeReligion: DATA.wifeReligion,
            wifeStatus: DATA.wifeStatus,
            wifeBirth: DATA.wifeBirth,
            wifeSign: DATA.wifeSign,
            witness1FullName: DATA.witness1FullName,
            witness1Address: DATA.witness1Address,
            witness1ID: DATA.witness1ID,
            witness1Sign: DATA.witness1Sign,
            witness2FullName: DATA.witness2FullName,
            witness2Address: DATA.witness2Address,
            witness2ID: DATA.witness2ID,
            witness2Sign: DATA.witness2Sign,
            priestSign: DATA.priestSign,
            marriagePhoto1: DATA.marriagePhoto1,
            marriagePhoto2: DATA.marriagePhoto2,
            appliedBy: DATA.appliedBy,
            path: "",
        };
        let MARRIAGE_FORM = {};
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: DATA.district });
        // FORM.placeOfBirth = new MONGOOSE.Types.ObjectId(DISTRICT._id)
        FORM.district = DISTRICT._id;

        CERTIFICATES_SCHEMA.findOne({ certi: 1 })
            .then(result => {
                MARRIAGE_FORM = result;
                FORM.certificateId = MARRIAGE_FORM._id;
                const TO_BE_SAVED = new MARRIAGE_FORM_SCHEMA(FORM);
                let SAVED_FORM;
                TO_BE_SAVED.save()
                    .then(result => {
                        SAVED_FORM = result;
                        const APPLIED_CERTIFICATE = {
                            certificateId: MARRIAGE_FORM._id,
                            formId: SAVED_FORM._id,
                            district: DISTRICT._id,
                            certificateNumber: "",
                            issued: false,
                            verified: false,
                            appliedBy: FORM.appliedBy,
                            holders: [{ firstName: `${DATA.husbandName}` }, { name: `${DATA.wifeName}` }]
                        }
                        const TO_BE_SAVED = APPLIED_CERTIFICATE_SCHEMA(APPLIED_CERTIFICATE);
                        TO_BE_SAVED.save()
                            .then(result => {
                                const APPLIED_CERTIFICATE = result;
                                MARRIAGE_FORM_SCHEMA.updateOne({ _id: SAVED_FORM._id }, { $set: { appliedCertificateId: APPLIED_CERTIFICATE._id } })
                                    .then(result => {
                                        CITIZEN_SCHEMA.updateOne({ _id: FORM.appliedBy }, { $push: { appliedFor: APPLIED_CERTIFICATE._id } })
                                            .then(() => {
                                                res.send(res_generator({ appliedFor: APPLIED_CERTIFICATE._id }, false, "Form Submitted"))
                                            })
                                            .catch(err => {
                                                console.log(err)
                                                res.send(res_generator(req.body, true, "Server side error"));
                                            })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        res.send(res_generator(req.body, true, "Server side error"));
                                    })
                            }).catch(err => {
                                console.log(err)
                                res.send(res_generator(req.body, true, "Server side error"));
                            })
                    }).catch(err => {
                        console.log(err)
                        res.send(res_generator(req.body, true, "Server side error"));
                    })
            }).catch(err => {
                console.log(err)
                res.send(res_generator(req.body, true, "Server side error"));
            })
    }
}
// ? Submit Death Form
// ! Can throw error
exports.submit_death_form = async (req, res) => {
    const DATA = req.body;
    if (
        !DATA.dateOfDeath ||
        !DATA.placeOfDeath ||
        !DATA.district ||

        !DATA.personAadhar ||
        !DATA.personName ||
        !DATA.deathType ||
        !DATA.deathReason ||

        !DATA.fillerAadhar ||
        !DATA.relation ||

        !DATA.hospitalDeclaration ||
        !DATA.crematoriumDeclaration ||
        !DATA.appliedBy
    ) {
        res.send(res_generator(req.body, true, "Insufficient data provided"));
    } else {
        const DATA = req.body;
        let FORM = {
            dateOfDeath: DATA.dateOfDeath,
            placeOfDeath: DATA.placeOfDeath,
            district: DATA.district,
            personAadhar: DATA.personAadhar,
            personName: DATA.personName,
            deathType: DATA.deathType,
            deathReason: DATA.deathReason,
            fillerAadhar: DATA.fillerAadhar,
            relation: DATA.relation,
            hospitalDeclaration: DATA.hospitalDeclaration,
            crematoriumDeclaration: DATA.crematoriumDeclaration,
            path: ""
        };
        let DEATH_FORM = {};
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: DATA.district });
        // FORM.placeOfBirth = new MONGOOSE.Types.ObjectId(DISTRICT._id)
        FORM.district = DISTRICT._id;

        CERTIFICATES_SCHEMA.findOne({ certi: 2 })
            .then(result => {
                DEATH_FORM = result;
                FORM.certificateId = DEATH_FORM._id;
                const TO_BE_SAVED = new DEATH_SCHEMA(FORM);
                let SAVED_FORM;
                TO_BE_SAVED.save()
                    .then(result => {
                        SAVED_FORM = result;
                        const APPLIED_CERTIFICATE = {
                            certificateId: DEATH_FORM._id,
                            formId: SAVED_FORM._id,
                            district: DISTRICT._id,
                            certificateNumber: "",
                            issued: false,
                            verified: false,
                            appliedBy: DATA.appliedBy,
                            holders: [{ firstName: `${DATA.personName}` }]
                        }
                        const TO_BE_SAVED = APPLIED_CERTIFICATE_SCHEMA(APPLIED_CERTIFICATE);
                        TO_BE_SAVED.save()
                            .then(result => {
                                const APPLIED_CERTIFICATE = result;
                                DEATH_SCHEMA.updateOne({ _id: SAVED_FORM._id }, { $set: { appliedCertificateId: APPLIED_CERTIFICATE._id } })
                                    .then(result => {
                                        CITIZEN_SCHEMA.updateOne({ _id: DATA.appliedBy }, { $push: { appliedFor: APPLIED_CERTIFICATE._id } })
                                            .then(result => {
                                                res.send(res_generator({ appliedFor: APPLIED_CERTIFICATE._id }, false, "Form Submitted"))
                                            }).catch(err => {
                                                console.log(err)
                                                res.send(res_generator(req.body, true, "Server side error"));
                                            })
                                    }).catch(err => {
                                        console.log(err)
                                        res.send(res_generator(req.body, true, "Server side error"));
                                    })
                            }).catch(err => {
                                console.log(err)
                                res.send(res_generator(req.body, true, "Server side error"));
                            })
                    }).catch(err => {
                        console.log(err)
                        res.send(res_generator(req.body, true, "Server side error"));
                    })
            }).catch(err => {
                console.log(err)
                res.send(res_generator(req.body, true, "Server side error"));
            })
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
                    send_mail(
                        email,
                        "OTP verification for Registration at Online Requisition portal - Gujarat",
                        `Your One Time Password is : ${OTP}`,
                        'Please do not share this OTP.'
                    )
                    const ENC_OTP = encrypt_string(OTP);
                    res.send(res_generator({ otp: ENC_OTP, aadhar: ORIGINAL_AADHAR }, false, 'OTP sent to the linked email with aadhar'));
                }
            })
    }
}

exports.get_free_slots = async (req, res) => {
    const SERVICE_NUMBER = parseInt(req.params.serviceNumber);
    const DISTRICT = req.params.district;

    const TODAY = new Date();
    const LAST_DAY = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0);
    let TOMORROW = new Date();
    TOMORROW.setDate(TOMORROW.getDate() + 1);
    let tempDate = new Date(TOMORROW);

    const AVAILABLE_SLOTS = [];

    let DATES = [];
    while (tempDate <= LAST_DAY) {
        DATES.push(new Date(tempDate))
        tempDate.setDate(tempDate.getDate() + 1);
    }
    // let SERVICE;
    let DISTRICT_ID;
    let CERTIFICATE_ID;
    for (var i = 0; i < 3; i++) {
        if (i === SERVICE_NUMBER) {
            const certi = await CERTIFICATES_SCHEMA.findOne({ certi: i });
            CERTIFICATE_ID = certi._id;
        }
    }
    const d = await DISTRICTS_SCHEMA.findOne({ name: DISTRICT });
    DISTRICT_ID = d._id;
    const TIMINGS = await SLOTS_INFORMATION.findOne({ district: DISTRICT_ID });
    let ALL_SLOTS;
    switch (SERVICE_NUMBER) {
        case 0:
            ALL_SLOTS = TIMINGS.birth;
            break;
        case 1:
            ALL_SLOTS = TIMINGS.marriage;
            break;
        case 2:
            ALL_SLOTS = TIMINGS.death;
            break;
    }
    var ALL_BOOKED_SLOTS;
    SLOTS_SCHEMA.find({ $and: [{ district: DISTRICT_ID }, { certificateId: CERTIFICATE_ID }], })
        .then(result => {
            ALL_BOOKED_SLOTS = result;
            let s0 = s1 = s2 = 0;
            DATES.forEach(date => {
                if (date.getDay() === 0 || date.getDay() === 6) {
                    // Do nothing
                } else {
                    const booked_on_date = ALL_BOOKED_SLOTS.filter(bookedSlot => {
                        return bookedSlot.date === new Date(date).toDateString();
                    });
                    booked_on_date.forEach(booked => {
                        if (booked.timing === 's0')
                            s0++;
                        else if (booked.timing === 's1')
                            s1++;
                        else if (booked.timing === 's2')
                            s2++;
                    })
                    if (s0 < ALL_SLOTS.s0.max)
                        AVAILABLE_SLOTS.push({ date, timing: 's0', hours: ALL_SLOTS.s0.time });
                    else if (s1 < ALL_SLOTS.s1.max)
                        AVAILABLE_SLOTS.push({ date, timing: 's1', hours: ALL_SLOTS.s1.time });
                    else if (s2 < ALL_SLOTS.s2.max)
                        AVAILABLE_SLOTS.push({ date, timing: 's2', hours: ALL_SLOTS.s2.time });

                    s0 = s1 = s2 = 0;
                }
            });
            // console.log(AVAILABLE_SLOTS)
            res.send(res_generator({ slots: AVAILABLE_SLOTS }, false, "Slots found!"));
        })
        .catch(err => {
            console.log(err)
        })
    // console.log(AVAILABLE_SLOTS);
}
exports.get_applied_data = async (req, res) => {
    if (
        !req.body.citizenId
    ) {
        res.send(res_generator(req.body, true, "Insufficient Data provided"));
    } else {
        let FINAL = [];
        const ID = new MONGOOSE.Types.ObjectId(req.body.citizenId);
        const DATA = await APPLIED_CERTIFICATE_SCHEMA.find({ appliedBy: ID });
        for (let i = 0; i < DATA.length; i++) {
            const SERVICE = await CERTIFICATES_SCHEMA.findOne({ _id: DATA[i].certificateId });
            let FORM;
            if (SERVICE.certi === 0) { FORM = "Birth Form" }
            else if (SERVICE.certi === 1) { FORM = "Marriage Form" }
            else if (SERVICE.certi === 2) { FORM = "Death Form" }
            const result = await SLOTS_SCHEMA.findOne({ appliedCertificateId: DATA[i]._id });
            if (result) {
                const slotInfo = await SLOTS_INFORMATION.findOne({ district: result.district });
                let timing;
                if (SERVICE.certi === 0) { timing = slotInfo.birth }
                else if (SERVICE.certi === 1) { timing = slotInfo.marriage }
                else if (SERVICE.certi === 2) { timing = slotInfo.death }
                FINAL.push({ applied: DATA[i], slot: result, hours: timing[result.timing].time, form: FORM })
            } else {
                FINAL.push({ applied: DATA[i], slot: null, form: FORM })
            }
        }
        res.send(res_generator({ appliedData: FINAL }, false, "Data fetched Successfully"));
    }
}
exports.get_district_certificate = async (req, res) => {
    if (
        !req.body.district
        || !req.body.certificate
    ) {
        res.send(res_generator(req.body, true, "Invalid data"));
    } else {
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ _id: new MONGOOSE.Types.ObjectId(req.body.district) });
        const CERTIFICATE = await CERTIFICATES_SCHEMA.findOne({ _id: new MONGOOSE.Types.ObjectId(req.body.certificate) });
        const data = { district: DISTRICT.name, service: CERTIFICATE.certi };
        if (DISTRICT && CERTIFICATE) {
            res.send(res_generator(data, false, "Fetched data"));
        } else {
            res.send(res_generator(req.body, true, "Could not find data"));
        }
    }
}
exports.book_slot = async (req, res) => {
    if (
        !req.body.district
        || !req.body.service
        || !req.body.slot
        || !req.body.appliedId
    ) {
        res.send(res_generator(req.body, true, "Invalid data"));
    } else {
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: req.body.district });
        const DISTRICT_ID = DISTRICT._id;
        const CERTIFICATE = await CERTIFICATES_SCHEMA.findOne({ certi: parseInt(req.body.service) });
        const CERTIFICATE_ID = CERTIFICATE._id;
        const SLOT_DATE = new Date(req.body.slot.date);
        const SLOT_TIMING = req.body.slot.timing;
        const TO_BE_SAVED = SLOTS_SCHEMA(
            {
                district: DISTRICT._id,
                certificateId: CERTIFICATE._id,
                date: new Date(SLOT_DATE).toDateString(),
                timing: SLOT_TIMING,
                appliedCertificateId: new MONGOOSE.Types.ObjectId(req.body.appliedId),
            }
        );
        const BOOKED_SLOT = await TO_BE_SAVED.save();
        let assignedClerk;
        const CLERKS = await CLERK_SCHEMA.find({ $and: [{ district: DISTRICT_ID }, { certificateId: CERTIFICATE_ID }], });
        var clerk_slot_info = [];
        for (let i = 0; i < CLERKS.length; i++) {
            const ASSIGNED_SLOTS = await SLOTS_SCHEMA.find(
                {
                    $and:
                        [
                            // {assignedTo:64b663caf6bdc2d8e7ba6f9c},{district:64b0db9ac7106a060202f43c}
                            // {certificateId:64b0ca36c78a2244149db638},{date:"Thu Jul 20 2023"},{timing:s0}
                            { assignedTo: CLERKS[i]._id },
                            { district: DISTRICT_ID },
                            { certificateId: CERTIFICATE_ID },
                            { date: BOOKED_SLOT.date },
                            { timing: BOOKED_SLOT.timing }
                        ],
                }
            )
            console.log(ASSIGNED_SLOTS)
            clerk_slot_info.push({ clerk: CLERKS[i], assignedLength: ASSIGNED_SLOTS.length });
        }
        console.log("---------------- un sorted array")
        console.log(clerk_slot_info);
        clerk_slot_info.sort((c1, c2) => {
            if (c1.assignedLength < c2.assignedLength) {
                return -1;
            } else if (c1.assignedLength > c2.assignedLength) {
                return 1;
            } else {
                return 0;
            }
        });
        clerk_slot_info.reverse();
        console.log("---------------- sorted array")
        console.log(clerk_slot_info);
        // 0 1 
        // 0 2

        // 0 1
        // 2 0
        for (var i = 0; i < clerk_slot_info.length; i++) {
            if (clerk_slot_info[i + 1] && clerk_slot_info[i].assignedLength === clerk_slot_info[i + 1].assignedLength) {
                continue;
            } else if (!clerk_slot_info[i + 1]) {
                assignedClerk = clerk_slot_info[0].clerk;
                break;
            } else if (clerk_slot_info[i].assignedLength > clerk_slot_info[i + 1].assignedLength) {
                assignedClerk = clerk_slot_info[i + 1].clerk;
                break;
            }
        }
        console.log("---------------- selected clerk")
        console.log(assignedClerk)

        const UPDATED = await SLOTS_SCHEMA.updateOne({ _id: BOOKED_SLOT._id }, { $set: { assignedTo: assignedClerk._id } })
        const UPDATED_CLERK = await CLERK_SCHEMA.updateOne({ _id: assignedClerk._id }, { $push: { assignedSlots: BOOKED_SLOT._id } })
        console.log("---------------- updated slot")
        console.log(UPDATED)
        res.send(res_generator(BOOKED_SLOT, false, "Booked"));
    }
}
exports.try_to_join = async (req, res) => {
    if (!req.body.slot) {
        res.send(res_generator(req.body, true, "Invalid request"));
    } else {
        const BOOKED_SLOT = await SLOTS_SCHEMA.findOne({ _id: new MONGOOSE.Types.ObjectId(req.body.slot._id) });
        const CLERK = await CLERK_SCHEMA.findOne({ _id: BOOKED_SLOT.assignedTo });
        if (CLERK.callId) {
            res.send(res_generator({ clerk: CLERK._id, callId: CLERK.callId }, false, "Verification officer online"));
        } else {
            res.send(res_generator(req.body, true, "Verification officer is not available yet, please try again in few minutes"));
        }
    }
}
exports.set_joined = async (req, res) => {
    const updated = await APPLIED_CERTIFICATE_SCHEMA.updateOne({ _id: new MONGOOSE.Types.ObjectId(req.body.appliedCertificateId) }, { $set: { joined: true } });
    res.send(res_generator(updated, false, "Status updated"))
}
