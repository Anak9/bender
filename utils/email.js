const nodemailer = require('nodemailer');

const sendEmail = async (text, email, subject) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const message = {
    from: 'Classbend <sarahelias308@gmail.com>',
    to: email,
    subject: subject,
    text: text,
    // html:
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
