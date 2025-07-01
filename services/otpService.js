const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.generateOTP = () => crypto.randomInt(10000, 99999).toString();

exports.sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP',
        html: `
      <div>
        <h3>Login Verification</h3>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 5 minutes</p>
      </div>
    `
    });
};