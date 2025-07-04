const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

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

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTPViaMessage = async (phone, otp) => {

  const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  try {
    console.log("Call sendOtp")
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    return message.sid;
  } catch (error) {
    throw new Error('Failed to send OTP: ' + error.message);
  }
};