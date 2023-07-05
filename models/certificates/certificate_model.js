const MONGOOSE = require("mongoose");
const CERTIFICATE_SCHEMA = MONGOOSE.Schema({
    name: {
        type: String,
        required: true
    }
});
module.exports = MONGOOSE.model("Certificate", CERTIFICATE_SCHEMA);