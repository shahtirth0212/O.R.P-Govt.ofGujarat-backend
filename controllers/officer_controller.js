const { res_generator } = require('../helpers/response_generator');

const SLOTS_SCHEMA = require("../models/verification_slots/slots_model");
const DISTRICTS_SCHEMA = require("../models/district_model");



exports.add_verification_slots = async (req, res) => {
    if (
        !req.body.district
        || !req.body.certificate
        || !req.body.month
        || !req.body.date
        || !req.body.slots
    ) {
        res.send(res_generator(req.body, true, "Insufficient data provided"));
    } else {
        const DATA = req.body;
        const DISTRICT = await DISTRICTS_SCHEMA.findOne({ name: req.body.district });
        for (let certi = 0; certi < 3; certi++) {
            switch (certi) {
                case 0:
                    DATA.certificate = "birth";
                    break;
                case 1:
                    DATA.certificate = "marriage";
                    break;
                case 2:
                    DATA.certificate = "death";
                    break;
            }
        }

    }
}