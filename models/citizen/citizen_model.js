const MONGOOSE = require("mongoose");
const CITIZEN_SCHEMA = MONGOOSE.Schema({
    aadharNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    appliedFor: {
        // [
        //     id -> applied certificate
        // ]
        type: Array,
        required: true
    }
});
module.exports = MONGOOSE.model("Citizen", CITIZEN_SCHEMA);