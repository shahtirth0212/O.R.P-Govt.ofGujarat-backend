const CERTIFICATES_SCHEMA = require("../models/certificates/certificate_model");
const DISTRICTS_SCHEMA = require("../models/district_model");
const CLERK_SCHEMA = require("../models/authorities/clerk_model");
const AADHAR_SCHEMA = require('../models/aadhar_model');
const SLOTS_INFORMATION = require("../models/verification_slots/slots_info_model");
const SLOTS_SCHEMA = require("../models/verification_slots/slots_model");
const APPLIED_CERTIFICATE_SCHEMA = require("../models/certificates/applied_certificates");

const { res_generator } = require("../helpers/response_generator");
const { bcrypt_password, authenticate_password } = require("../helpers/password_bcrypt");
const { generate_token } = require("../helpers/services/token_services");
const MONGOOSE = require("mongoose");
const { decrypt_aadhar } = require("../helpers/ecry_dcry_aadhar");


exports.clerk_register = async (req, res) => {
    const DATA = req.body;
    if (
        !DATA.aadharData ||
        !DATA.district ||
        !DATA.service ||
        !DATA.password
    ) {
        res.send(res_generator(req.body, true, 'Invalid aadhar number'));
    } else {
        const CERTIFICATE = await CERTIFICATES_SCHEMA.findOne({ certi: DATA.service.n });
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: DATA.district });
        const CLERK = {
            aadharNumber: DATA.aadharData.aadharNumber,
            email: DATA.aadharData.email,
            password: bcrypt_password(DATA.password),
            district: DISTRICT._id,
            certificateId: CERTIFICATE._id,
            assignedSlots: [],
            verifiedForms: [],
            eligible: false
        };
        const TO_BE_SAVED = new CLERK_SCHEMA(CLERK);
        const SAVED = await TO_BE_SAVED.save();
        res.send(res_generator(SAVED, false, "Registered, Please wait till verification for log in"))

    }
}
exports.clerk_login = async (req, res) => {
    const DATA = req.body;
    if (
        !DATA.email ||
        !DATA.password
    ) {
        res.send(res_generator(req.body, true, 'Invalid aadhar number'));
    } else {
        const found = await CLERK_SCHEMA.findOne({ email: DATA.email })
        if (!found) {
            res.send(res_generator(req.body, true, 'Cannot find your account'));
        } else if (found && !found.eligible) {
            res.send(res_generator(req.body, true, 'Under verification'));
        } else {
            if (!authenticate_password(DATA.password, found)) {
                res.send(res_generator(DATA, true, "Aadhar number and password combinations are invalid"));
            } else {
                const service = await CERTIFICATES_SCHEMA.findOne({ _id: found.certificateId })
                const district = await DISTRICTS_SCHEMA.findOne({ _id: found.district });
                const aadhar = await AADHAR_SCHEMA.findOne({ aadharNumber: found.aadharNumber });
                const aadharData = decrypt_aadhar(aadhar);
                const CLERK = {
                    _id: found._id,
                    email: found.email,
                    aadharData,
                    assignedSlots: found.assignedSlots,
                    verifiedForms: found.verifiedForms,
                    district: district,
                    service
                };
                const token = generate_token(CLERK);
                CLERK.token = token;
                res.send(res_generator(CLERK, false, 'Login successful'));
            }

        }
    }
}
exports.get_live_requests = async (req, res) => {
    const DATA = req.body;
    if (!DATA.clerkId || !DATA.certi || !DATA.service_id) {
        res.send(res_generator(req.body, true, 'Invalid aadhar number'));
    } else {
        DATA.certi = parseInt(DATA.certi);
        let certi_string;
        if (DATA.certi === 0) {
            certi_string = 'birth'
        } else if (DATA.certi === 1) {
            certi_string = 'marriage'
        } else if (DATA.certi === 2) {
            certi_string = 'death'
        }
        var requests = await SLOTS_SCHEMA.find(
            {
                $and:
                    [
                        { assignedTo: new MONGOOSE.Types.ObjectId(DATA.clerkId) },
                        { certificateId: new MONGOOSE.Types.ObjectId(DATA.service_id) },
                        { date: new Date().toDateString() }
                    ]
            }
        );
        for (var i = 0; i < requests.length; i++) {
            requests[i] = requests[i]._doc;
            const district = await DISTRICTS_SCHEMA.findOne({ _id: requests[i].district });
            const timing = await SLOTS_INFORMATION.findOne({ district: district._id });
            const applied_certi = await APPLIED_CERTIFICATE_SCHEMA.findOne({ _id: requests[i].appliedCertificateId });
            const slot = timing[certi_string][requests[i].timing];
            requests[i]['added'] = {};
            requests[i].added.district = district.name;
            requests[i].added.timing = slot;
            requests[i].added.applied_certi = applied_certi;
        }
        res.send(res_generator(requests, false, "Data retrieved"));
    }
}

// 0 -> stopeed
// 1-> in process of verification
exports.toggle_verification_status = async (req, res) => {
    if (!req.body.clerkId || !req.params.status) {
        res.send(res_generator(req.body, true, "Invalid request"));
    } else {
        if (req.params.status === 'start') {
            const updated = await CLERK_SCHEMA.updateOne({ _id: new MONGOOSE.Types.ObjectId(req.body.clerkId) }, { $set: { callId: req.body.socketId } });
            res.send(res_generator(req.body, false, "Changed"));
        } else if (req.params.status === 'stop') {
            const updated = await CLERK_SCHEMA.updateOne({ _id: new MONGOOSE.Types.ObjectId(req.body.clerkId) }, { $set: { callId: null } });
            res.send(res_generator(req.body, false, "Changed"));

        }
    }
}