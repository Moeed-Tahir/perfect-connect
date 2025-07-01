const mongoose = require('mongoose');

const hostFamilySchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        sparse: true
    },
    otp: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{5}$/, 'OTP must be a 5-digit number']
    },
    otpExpires: {
        type: Date,
        required: true
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const hostFamily = mongoose.model('hostFamily', hostFamilySchema);
module.exports = hostFamily;

