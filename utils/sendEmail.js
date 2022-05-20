const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

const sendEmail = async ({to, subject, html}) => {
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport(nodemailerConfig);

    return transporter.sendMail({
        from: '"WSB" <wsb@noreply.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
      });
}

module.exports = sendEmail;