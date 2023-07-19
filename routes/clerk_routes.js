const EXPRESS = require('express');

const CLERK_CTRL = require("../controllers/clerk_controller");



const ROUTER = EXPRESS.Router();

ROUTER.post('/register', CLERK_CTRL.clerk_register);
ROUTER.post('/login', CLERK_CTRL.clerk_login);
ROUTER.post('/get-live-requests', CLERK_CTRL.get_live_requests);
ROUTER.post("/toggle-verification-status/:status", CLERK_CTRL.toggle_verification_status);
module.exports = ROUTER;

