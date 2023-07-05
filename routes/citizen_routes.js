const EXPRESS = require('express');

const CITIZEN_CTRL = require('../controllers/citizen_controller');
const AUTH_CTRL = require('../controllers/auth_controller');

const ROUTER = EXPRESS.Router();

// ! Register routes for Citizen
ROUTER.post('/register', CITIZEN_CTRL.register_citizen);
ROUTER.post('/verify-otp-for-registration', CITIZEN_CTRL.verify_citizen_otp);

// ! Login routes for Citizen
ROUTER.post('/login', CITIZEN_CTRL.login_citizen);





module.exports = ROUTER;

