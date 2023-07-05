require("dotenv/config");
const BCRYPT = require('bcrypt');


exports.bcrypt_password = (password) => {
    return BCRYPT.hashSync(password, parseInt(process.env.BCRYPT_NUMBER_OF_ROUNDS))
}
exports.authenticate_password = (password, user) => {
    return BCRYPT.compareSync(password, user.password);
    //   Plaintext entered by the user, encrypted string  stored in the database
}