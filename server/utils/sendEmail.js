// 'use strict'
// const nodemailer = require('nodemailer');
// const aws = require('aws-sdk');
// const Logger = require('./logging');
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//     SES: new aws.SES({
//         apiVersion: process.env.AWS_API_VERSION,
//         region: process.env.AWS_REGION,
//         sendingRate: process.env.AWS_SENDING_RATE,
//     }),
// });

// const sendEmail = async (from = {}, to, subject, text, html, attachments) => {
//     /*
//      * from is an object which should have email and name keys with their values
//      * to can be a list of emails that are comma separated
//      * attachments is an array with attachments
//      */
//     if (!from.email || !from.name) {
//         throw new Error('Please pass the from object with email and name keys with their values');
//     }
//     try {
//         const response = await transporter.sendMail({
//             from: `${from.name} <${from.email}>`,
//             to,
//             subject,
//             text,
//             html,
//             attachments,
//         });
//         return true;
//     } catch (e) {
//         Logger.log(
//             'error',
//             'Error: ', {
//                 fullError: e,
//                 request: 'sending email in the original file',
//                 technicalMessage: `Could not send email`,
//                 customerMessage: "Could not send email",
//             },
//         );
//         throw new Error(e);
//     }
// };

// module.exports = sendEmail;
