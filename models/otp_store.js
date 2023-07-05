const MONGOOSE = require("mongoose");
const OTP_STORE_SCHEMA = MONGOOSE.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});
module.exports = MONGOOSE.model("OTPStore", OTP_STORE_SCHEMA);