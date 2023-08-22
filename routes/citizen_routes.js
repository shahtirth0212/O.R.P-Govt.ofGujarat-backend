const EXPRESS = require('express');

const CITIZEN_CTRL = require('../controllers/citizen_controller');
const AUTH_CTRL = require('../controllers/auth_controller');

const ROUTER = EXPRESS.Router();

// ! Register routes for Citizen
ROUTER.post('/register', CITIZEN_CTRL.register_citizen);
ROUTER.post('/authenticate-aadhar', CITIZEN_CTRL.authenticate_aadhar);
ROUTER.post('/verify-otp-for-aadhar', CITIZEN_CTRL.verify_otp_for_aadhar);
// ! Login routes for Citizen
ROUTER.post('/login', CITIZEN_CTRL.login_citizen);
// ! Services Routes
ROUTER.post("/submit-birth-form", CITIZEN_CTRL.submit_birth_form);
ROUTER.post("/submit-marriage-form", CITIZEN_CTRL.submit_marriage_form);
ROUTER.post("/submit-death-form", CITIZEN_CTRL.submit_death_form);

ROUTER.post('/services-aadhar-verification', CITIZEN_CTRL.aadhar_verification);

ROUTER.get('/get-free-slots/:serviceNumber/:district', CITIZEN_CTRL.get_free_slots);
ROUTER.post("/book-slot", CITIZEN_CTRL.book_slot);
ROUTER.post("/try-to-join", CITIZEN_CTRL.try_to_join);

ROUTER.post("/get-applied-data", CITIZEN_CTRL.get_applied_data);
ROUTER.post("/get-district-certificate", CITIZEN_CTRL.get_district_certificate);

ROUTER.post("/set-joined", CITIZEN_CTRL.set_joined);
module.exports = ROUTER;

