const { res_generator } = require("../helpers/response_generator");
const { encrypt_aadhar } = require("../helpers/ecry_dcry_aadhar");
const { error_printer } = require("../helpers/error_printer");
const { bcrypt_password, authenticate_password } = require("../helpers/password_bcrypt");
const { generate_token } = require('../helpers/services/token_services');
const { send_mail } = require('../helpers/services/mail_services');

const AADHAR_MODEL = require("../models/aadhar_model");
const ADMIN_MODEL = require("../models/admin_model");

const DISTRICTS = {
    Ahmedabad: 'Ahmedabad',
    Amreli: 'Amreli',
    Anand: 'Anand',
    Aravalli: 'Aravalli',
    Banaskantha: 'Banaskantha',
    Bharuch: 'Bharuch',
    Bhavnagar: 'Bhavnagar',
    Botad: 'Botad',
    Chhotaudipur: 'Chhotaudipur',
    Dahod: 'Dahod',
    Dang: 'Dang',
    DevbhumiDwarka: 'Devbhumi Dwarka',
    Gandhinagar: 'Gandhinagar',
    GirSomnath: 'Gir Somnath',
    Jamnagar: 'Jamnagar',
    Junagadh: 'Junagadh',
    Kheda: 'Kheda',
    Kutch: 'Kutch',
    Mahisagar: 'Mahisagar',
    Mehsana: 'Mehsana',
    Morbi: 'Morbi',
    Narmada: 'Narmada',
    Navsari: 'Navsari',
    Panchmahal: 'Panchmahal',
    Patan: 'Patan',
    Porbandar: 'Porbandar',
    Rajkot: 'Rajkot',
    Sabarkantha: 'Sabarkantha',
    Surat: 'Surat',
    Surendranagar: 'Surendranagar',
    Tapi: 'Tapi',
    Valsad: 'Valsad',
    Vadodara: 'Vadodara'
}
const GENDER = {
    male: 'male',
    female: 'female',
    others: 'others'
}



exports.admin_login = (req, res) => {
    if (
        !req.body.email
        || !req.body.password
    ) {
        res.send(res_generator(req.body, true, 'Insufficient data provided'));
    } else {
        const admin = {
            email: req.body.email,
            password: req.body.password
        }
        ADMIN_MODEL.find({ email: admin.email })
            .then(result => {
                console.log(result)
                if (result.length < 1) {
                    res.send(res_generator(req.body, true, 'User does not exist'));
                } else {
                    const found_user = result[0];
                    if (!authenticate_password(admin.password, found_user)) {
                        res.send(res_generator(admin, true, 'Invalid credentials'));
                    } else {
                        const token = generate_token(found_user)
                        send_mail(admin.email, `New login at ${new Date().toTimeString()}`, 'Login successful for Online requisite portal', 'If it was not you, please mail us at shahtirth0212@gmail.com');
                        res.send(res_generator({ token }, false, 'Login successful'));
                    }
                }
            })
            .catch(err => {
                error_printer('At Finding admin / Login time', err);
                res.send(res_generator(copy_of_admin, true, 'Server side error, please try again later'));
            })
    }
}
exports.add_aadhar = (req, res) => {
    if (
        !req.body.aadharNumber
        || !req.body.firstName
        || !req.body.middleName
        || !req.body.lastName
        || !req.body.gender
        || !req.body.DOB
        || !req.body.addressLine
        || !req.body.district
        || !req.body.state
        || !req.body.mobile
        || !req.body.email
    ) {
        res.send(res_generator(req.body, true, 'Insufficient data provided'));
    }
    else {
        const data = {
            aadharNumber: req.body.aadharNumber,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            DOB: req.body.DOB,
            addressLine: req.body.addressLine,
            district: req.body.district,
            state: req.body.state,
            mobile: req.body.mobile,
            email: req.body.email,
        }
        if (
            data.aadharNumber.trim().length != 12
            || data.firstName.trim().length < 3
            || data.middleName.trim().length < 3
            || data.lastName.trim().length < 3
            || !(GENDER[data.gender])
            || new Date(data.DOB) > new Date()
            // new Date(data.DOB).toLocaleDateString()
            || data.addressLine.trim().length < 4
            || !(DISTRICTS[data.district])
            || data.state.trim() != 'Gujarat'
            || data.mobile.trim().length != 10
            || data.email.trim().length < 1
        ) {
            res.send(res_generator(req.body, true, 'Invalid data provided'));
        } else {
            const encry_data = encrypt_aadhar({ ...data });
            AADHAR_MODEL.find({ aadharNumber: data.aadharNumber })
                .then(aadhar => {
                    if (aadhar.length > 0) {
                        res.send(res_generator(data, true, 'Addhar already exists'));
                    } else {
                        const TO_BE_SAVED = new AADHAR_MODEL(encry_data);
                        TO_BE_SAVED.save()
                            .then((result) => {
                                res.send(res_generator(data, false, 'Addhar added successfully'));
                            }).catch((err) => {
                                error_printer('At adding the new aadhar', err);
                                res.send(res_generator(data, true, 'Server side error, please try again later'));
                            });
                    }
                })
                .catch(err => {
                    error_printer('At finding the aadhar', err);
                    res.send(res_generator(data, true, 'Server side error, please try again later'));
                })
        }
    }
}
exports.new_admin = (req, res) => {
    if (
        !req.body.name
        || !req.body.email
        || !req.body.password

    ) {
        res.send(res_generator(req.body, true, 'Insufficient data provided'));
    } else {
        const admin = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
        const copy_of_admin = { ...admin };
        ADMIN_MODEL.find({ email: req.body.email })
            .then(user => {
                if (user.length > 0) {
                    res.send(res_generator(req.body, true, "User already exists"));
                } else {
                    admin.password = bcrypt_password(admin.password);
                    const NEW_ADMIN = new ADMIN_MODEL(admin);
                    NEW_ADMIN.save()
                        .then(() => {
                            send_mail(admin.email, `Successfully signed up at ${new Date().toTimeString()}`, 'Sign up successful for Online requisite portal', 'If it was not you, please mail us at shahtirth0212@gmail.com');
                            res.send(res_generator(copy_of_admin, false, 'New admin created'));
                        })
                        .catch(err => {
                            error_printer('Creating new admin', err);
                            res.send(res_generator(copy_of_admin, true, 'Server side error, please try again later'));
                        })
                }
            })
            .catch(err => {
                error_printer('At Finding admin', err);
                res.send(res_generator(copy_of_admin, true, 'Server side error, please try again later'));
            })
    }
}