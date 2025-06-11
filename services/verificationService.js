const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate random 4-digit code
const generateVerificationCode = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Email verification
const  sendEmailVerification = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendEmailVerification = sendEmailVerification;
exports.generateVerificationCode = generateVerificationCode;