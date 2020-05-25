const env = require('../config/env-vars');
const nodemailer = require('nodemailer');

module.exports = {
    sendEmail
};

function sendEmail(to, productInfo) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.mailer_email,
            pass: env.mailer_pass
        }
    });

    let mailOptions = {
        from: env.mailer_email,
        to: to,
        subject: 'Product Deleted',
        text: 'Your product ' + productInfo + 'has been deleted'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
