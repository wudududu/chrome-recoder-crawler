'use strict'

const nodemailer = require('nodemailer');
const emailConf = require('./config.json').emailConfig;

const transporter = nodemailer.createTransport(emailConf);
const mailOptions = {
  from: emailConf.auth.user,
  to: emailConf.to,
  subject: '',
  html: ''
};

function sendMsg(obj) {
  console.log(obj)
  mailOptions.subject = 'auto puppeteer bot:' + (obj.subject || '');
  mailOptions.html = ``;

  Object.keys(obj).forEach(key => {
    let v = obj[key];
    console.log(v)
    mailOptions.html += `<p>${key}:${typeof v === 'object' ? JSON.stringify(v) : (v && v.toString ? v.toString() : '')}</p>`
  })

  console.log(mailOptions)
  
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(info);
        return;
      }

      resolve()
    });
  })
  
}

module.exports = { sendMsg }