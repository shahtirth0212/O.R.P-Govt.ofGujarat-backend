const MONGOOSE = require("mongoose");

const MARRIAGE_FORM = MONGOOSE.Schema({
    //! ------------------ Certificate details
    certificateId: {
        // Birth Marriage Death
        type: String,
        required: true
    },
    appliedCertificateId: {
        type: String,
        required: true
    },
    dateOfMarriage: {
        type: Date,
        required: true
    },
    placeOfMarriage: {
        type: String,
        required: true
    },
    //! ------------------ Groom's details
    groomAadhar: {
        type: String,
        required: true
    },
    groomReligion: {
        type: String,
        required: true
    },
    groomStatusAtMarriage: {
        type: String,
        required: true
    },
    groomFatherAadhar: {
        type: Number,
        required: true
    },
    //! ------------------ Bride's details
    brideAadhar: {
        type: String,
        required: true
    },
    brideReligion: {
        type: String,
        required: true
    },
    brideStatusAtMarriage: {
        type: String,
        required: true
    },
    brideFatherAadhar: {
        type: Number,
        required: true
    },
    //! ------------------ Documents
    groomSignDOC: {
        type: String,
        required: true
    },
    brideSignDOC: {
        type: String,
        required: true
    },
    priestSignDOC: {
        type: String,
        required: true
    },
    groomBirthCertiDOC: {
        type: String,
        required: true
    },
    brideBirthCertiDOC: {
        type: String,
        required: true
    },
    marriagePhotosDOC: {
        // [
        //     base64Image...
        //     base64Image...
        // ]
        type: Array,
        required: true
    },
    //! ------------------ Issued certificate details
    path: {
        type: String,
        required: true
    },
});

module.exports = MONGOOSE.model("MarriageForm", MARRIAGE_FORM);