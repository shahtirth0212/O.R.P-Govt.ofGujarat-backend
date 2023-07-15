const MONGOOSE = require("mongoose");

const SLOTS_SCHEMA = MONGOOSE.Schema({
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    certificateId: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timing: {
        type: String,
        required: true
    },
    appliedCertificateId: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    assignedTo: {
        type: MONGOOSE.Types.ObjectId,
    }

});

module.exports = MONGOOSE.model("Slot", SLOTS_SCHEMA);