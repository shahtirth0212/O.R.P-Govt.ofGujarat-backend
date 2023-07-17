const MONGOOSE = require("mongoose");

const DEATH_FORM = MONGOOSE.Schema({
    //! ------------------ Deceased person details
    certificateId: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    appliedCertificateId: {
        type: MONGOOSE.Types.ObjectId,
    },
    dateOfDeath: {
        type: Date,
        required: true
    },
    placeOfDeath: {
        type: String,
        required: true
    },
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },

    personAadhar: {
        type: String,
        required: true
    },
    personName: {
        type: String,
        required: true
    },
    deathType: {
        type: String,
        required: true
    },
    deathReason: {
        type: String,
        required: true
    },
    //! ------------------ Form filler's details
    fillerAadhar: {
        type: String,
        required: true
    },
    relation: {
        type: String,
        required: true
    },
    //! ------------------ Other details
    hospitalDeclaration: {
        type: String,
        required: true
    },
    crematoriumDeclaration: {
        type: String,
        required: true
    },
    //! ------------------ Issued certificate details
    path: {
        type: String,
    },
});

module.exports = MONGOOSE.model("DeathForm", DEATH_FORM);