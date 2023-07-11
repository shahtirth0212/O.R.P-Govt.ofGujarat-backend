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
ROUTER.post('/services-aadhar-verification', CITIZEN_CTRL.aadhar_verification);




module.exports = ROUTER;

