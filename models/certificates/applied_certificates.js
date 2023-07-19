const MONGOOSE = require("mongoose");
const APPLIED_CERTIFICATE_SCHEMA = MONGOOSE.Schema({
    certificateId: {
        // Birth Marriage Death
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    formId: {
        // Form id -> death_certificate_form,BirthForm or MarriageForm
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    // slotId: {
    //     type: MONGOOSE.Types.ObjectId,
    //     required: true
    // },
    certificateNumber: {
        // Number assigned by the authorities
        type: String,
    },
    issued: {
        type: Boolean,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    appliedBy: {
        // Citizin Id
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    holders: {
        // [
        //     { name: abc, aadhar: 1234 },
        //     { name: xyz, aadhar: 7891 },
        // ]
        type: Array,
        required: true
    }
});

module.exports = MONGOOSE.model("AppliedCertificate", APPLIED_CERTIFICATE_SCHEMA);