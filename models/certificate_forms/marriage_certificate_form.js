const MONGOOSE = require("mongoose");

const MARRIAGE_FORM = MONGOOSE.Schema({
    //! ------------------ Certificate details
    certificateId: {
        // Birth Marriage Death
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    appliedCertificateId: {
        type: MONGOOSE.Types.ObjectId,
    },
    dateOfMarriage: {
        type: Date,
        required: true
    },
    placeOfMarriage: {
        type: String,
        required: true
    },
    district: {
        type: MONGOOSE.Types.ObjectId,
        required: true
    },
    //! ------------------ Husband's details
    husbandAadhar: {
        type: String,
        required: true
    },
    husbandReligion: {
        type: String,
        required: true
    },
    husbandStatus: {
        type: String,
        required: true
    },
    // Husband Documents
    husbandBirth: {
        type: String,
        required: true
    },
    husbandSign: {
        type: String,
        required: true
    },

    //! ------------------ Wife's details
    wifeAadhar: {
        type: String,
        required: true
    },
    wifeReligion: {
        type: String,
        required: true
    },
    wifeStatus: {
        type: String,
        required: true
    },
    // Wife Documents
    wifeBirth: {
        type: String,
        required: true
    },
    wifeSign: {
        type: String,
        required: true
    },
    //! ------------------ Witness 1
    witness1FullName: {
        type: String,
        required: true
    },
    witness1Address: {
        type: String,
        required: true
    },
    witness1ID: {
        type: String,
        required: true
    },
    witness1Sign: {
        type: String,
        required: true
    },
    //! ------------------ Witness 2
    witness2FullName: {
        type: String,
        required: true
    },
    witness2Address: {
        type: String,
        required: true
    },
    witness2ID: {
        type: String,
        required: true
    },
    witness2Sign: {
        type: String,
        required: true
    },
    // ! --------------------- Priest sign and marriage photo
    priestSign: {
        type: String,
        required: true
    },
    marriagePhoto1: {
        type: String,
        required: true
    },
    marriagePhoto2: {
        type: String,
        required: true
    },
    //! ------------------ Issued certificate details
    path: {
        type: String,
    },
});

module.exports = MONGOOSE.model("MarriageForm", MARRIAGE_FORM);