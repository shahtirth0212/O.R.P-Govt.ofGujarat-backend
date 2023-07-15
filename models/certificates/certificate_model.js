const MONGOOSE = require("mongoose");
const CERTIFICATE_SCHEMA = MONGOOSE.Schema({
    certi: {
        type: Number,
        required: true
    }
});
module.exports = MONGOOSE.model("Certificate", CERTIFICATE_SCHEMA);