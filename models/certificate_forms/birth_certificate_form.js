const MONGOOSE = require("mongoose");

const BIRTH_FORM = MONGOOSE.Schema({
    //! ------------------ Child details
    certificateId: {
        type: String,
        required: true
    },
    appliedCertificateId: {
        type: String,
        required: true
    },
    childBirthDate: {
        type: Date,
        required: true
    },
    childGender: {
        type: String,
        required: true
    },
    childFirstName: {
        type: String,
        required: true
    },
    childMiddleName: {
        type: String,
        required: true
    },
    childLastName: {
        type: String,
        required: true
    },
    childWeight: {
        type: Number,
        required: true
    },
    placeOfBirth: {
        type: String,
        required: true
    },
    //! ------------------ Mother's details
    motherAadhar: {
        type: String,
        required: true
    },
    motherReligion: {
        type: String,
        required: true
    },
    motherLiteracy: {
        type: String,
        required: true
    },
    motherAgeAtMarriage: {
        type: Number,
        required: true
    },
    motherAgeAtBirth: {
        type: Number,
        required: true
    },
    motherOccupation: {
        type: String,
        required: true
    },
    motherTotalChildrenAtThisBirth: {
        type: Number,
        required: true
    },

    //! ------------------ Mother's details
    fatherAadhar: {
        type: String,
        required: true
    },
    fatherReligion: {
        type: String,
        required: true
    },
    fatherLiteracy: {
        type: String,
        required: true
    },
    fatherOccupation: {
        type: String,
        required: true
    },
    //! ------------------ Other details
    postDeliveryTreatment: {
        type: String,
        required: true
    },
    deliveryType: {
        type: String,
        required: true
    },
    pregnancyDurationWeeks: {
        type: Number,
        required: true
    },
    //! ------------------ Documents
    permanentAddProofDOC: {
        type: String,
        required: true
    },
    marraigeCertificateDOC: {
        type: String,
        required: true
    },
    proofOfBirthDOC: {
        type: String,
        required: true
    },
    //! ------------------ Issued certificate details
    path: {
        type: String,
        required: true
    },
});

module.exports = MONGOOSE.model("BirthForm", BIRTH_FORM);