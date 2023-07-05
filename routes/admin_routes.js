const EXPRESS = require('express');

const ADMIN_CTRL = require('../controllers/admin_controller');
const AUTH_CTRL = require('../controllers/auth_controller');

const ROUTER = EXPRESS.Router();

ROUTER.post('/', ADMIN_CTRL.admin_login);
ROUTER.post('/add-admin', AUTH_CTRL, ADMIN_CTRL.new_admin);

ROUTER.post('/add-aadhar', AUTH_CTRL, ADMIN_CTRL.add_aadhar);

module.exports = ROUTER;

