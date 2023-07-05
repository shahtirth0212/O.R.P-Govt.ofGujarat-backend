require("dotenv/config");

const JWT = require('jsonwebtoken');
const { res_generator } = require('../helpers/response_generator');
const { error_printer } = require('../helpers/error_printer');

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        res.send(res_generator(req.body, true, "Not authorized"));
    } else if (authHeader) {
        const token = authHeader.split(' ')[3];
        if (!token) {
            res.send(res_generator(req.body, true, "Not authorized"));
        } else {
            let decoded;
            try {
                decoded = JWT.verify(token, process.env.TOKEN_GENERATION_SECRET_KEY);
            } catch (err) {
                error_printer('decoding the token, malformed token found', err);
                res.send(res_generator(req.body, true, "Not authorized"));
            }
            if (decoded) {
                req.email = decoded.email;
                next();
            }
        }
    }
}