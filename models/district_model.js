const MONGOOSE = require("mongoose");

const DISTRICT_SCHEMA = MONGOOSE.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = MONGOOSE.model("District", DISTRICT_SCHEMA);