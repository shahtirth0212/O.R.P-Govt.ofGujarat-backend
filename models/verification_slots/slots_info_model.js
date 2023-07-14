const MONGOOSE = require("mongoose");
const SLOTS_INFO_SCHEMA = MONGOOSE.Schema({
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    birth: {
        type: Object,
        required: true
    },
    marriage: {
        type: Object,
        required: true
    },
    death: {
        type: Object,
        required: true
    }
});

module.exports = MONGOOSE.model("SlotInformation", SLOTS_INFO_SCHEMA);