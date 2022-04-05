'use strict'

const nodemailer = require('nodemailer');

function sendMsg(configPath, obj) {
  const emailConf = require(configPath).emailConfig;

  const transporter = nodemailer.createTransport(emailConf);
  const mailOptions = {
    from: emailConf.auth.user,
    to: emailConf.to,
    subject: '',
    html: ''
  };

  mailOptions.subject = 'auto puppeteer bot:' + (obj.subject || '');
  mailOptions.html = ``;

  Object.keys(obj).forEach(key => {
    let v = obj[key];
    mailOptions.html += `<p>${key}:${typeof v === 'object' ? JSON.stringify(v) : (v && v.toString ? v.toString() : '')}</p>`
  })
  
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