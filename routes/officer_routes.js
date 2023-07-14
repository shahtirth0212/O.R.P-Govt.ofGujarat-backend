const EXPRESS = require('express');

const OFFICER_CTRL = require("../controllers/officer_controller");



const ROUTER = EXPRESS.Router();

ROUTER.post('/add-slot', OFFICER_CTRL.add_verification_slots);

module.exports = ROUTER;

