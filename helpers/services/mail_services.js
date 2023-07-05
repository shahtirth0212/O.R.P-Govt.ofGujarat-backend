require("dotenv/config");


const NODEMAILER = require("nodemailer");
const MAINGEN = require('mailgen');


const MAIL_HOST_CONFIG = {
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_KEY
    }
}
const TRANSPORTER = NODEMAILER.createTransport(MAIL_HOST_CONFIG);
let MAIL_GENERATOR = new MAINGEN({
    theme: 'default',
    product: {
        name: 'Mailgen',
        link: "https://mailgen.js"
    }
});



exports.send_mail = (to, subject, intro, outro) => {
    const mail = MAIL_GENERATOR.generate({ body: { intro, outro } });
    const message = {
        from: process.env.MAIL_USER,
        to: to,
        subject: subject,
        html: mail
    }
    TRANSPORTER.sendMail(message)
        .then(() => {
            // console.log('\n\n\n\n Mail sent to ' + to + "\n\n");
        }).catch(err => {
            console.log(err)
        })
    return
}