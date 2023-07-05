require("dotenv/config");

const JWT = require('jsonwebtoken');


exports.generate_token = (user) => {
    const token = JWT.sign(
        {
            email: user.email,
            _id: user._id.toString()
        },
        process.env.TOKEN_GENERATION_SECRET_KEY,
        { expiresIn: '1h' }
    )
    return token;
}
