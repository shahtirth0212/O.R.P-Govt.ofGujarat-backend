const MONGOOSE = require("mongoose");

const ADMIN_SCHEMA = MONGOOSE.Schema({
    name: {
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
    }
});

module.exports = MONGOOSE.model("Admin", ADMIN_SCHEMA);