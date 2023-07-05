const MONGOOSE = require("mongoose");
const APPLICATION_SCHEMA = MONGOOSE.Schema({
    certificateId: {
        // Birth Marriage Death
        type: String,
        required: true
    },
    isDraft: {
        type: Boolean,
        required: true
    },
    certificateNumber: {
        // Number assigned by the authorities
        type: String,
        required: true,
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
        type: String,
        required: true
    },
    formId: {
        // Form id -> death_certificate_form,BirthForm or MarriageForm
        type: String,
        required: true
    },
    assignedTo: {
        // Clerk id
        type: String,
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

module.exports = MONGOOSE.model("Application", APPLICATION_SCHEMA);