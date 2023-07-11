const MONGOOSE = require("mongoose");

const DEATH_FORM = MONGOOSE.Schema({
    //! ------------------ Deceased person details
    certificateId: {
        type: String,
        required: true
    },
    appliedCertificateId: {
        type: String,
        required: true
    },
    personAadhar: {
        type: String,
        required: true
    },
    placeOfDeath: {
        type: String,
        required: true
    },
    deathType: {
        type: String,
        required: true
    },
    reasonOfDeath: {
        type: String,
        required: true
    },
    //! ------------------ Form filler's details
    fillerAadhar: {
        type: String,
        required: true
    },
    relationToThePerson: {
        type: String,
        required: true
    },
    //! ------------------ Other details
    hospitalName: {
        type: String,
        required: true
    },
    // ! Documents
    deathDeclarationDOC: {
        type: String,
        required: true
    },
    //! ------------------ Issued certificate details
    path: {
        type: String,
        required: true
    },
});

module.exports = MONGOOSE.model("DeathForm", DEATH_FORM);