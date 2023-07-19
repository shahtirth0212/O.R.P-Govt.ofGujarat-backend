const MONGOOSE = require("mongoose");
const CLERK_SCHEMA = MONGOOSE.Schema({
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
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    certificateId: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    assignedSlots: {
        // Array of slots id from slot Collection
        type: Array,
    },
    verifiedForms: {
        type: Array,
    },
    eligible: {
        type: Boolean,
        required: true
    },
    callId: {
        type: String,
    }
});
module.exports = MONGOOSE.model("Clerk", CLERK_SCHEMA);