const MONGOOSE = require("mongoose");

const AADHAR_SCHEMA = MONGOOSE.Schema({
    aadharNumber: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    DOB: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    }


});

module.exports = MONGOOSE.model("Aadhar", AADHAR_SCHEMA);