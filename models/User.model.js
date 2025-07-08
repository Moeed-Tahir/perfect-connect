const mongoose = require('mongoose');

// Common schemas
const parentSchema = new mongoose.Schema({
    role: String,
    firstName: String,
    lastName: String,
    age: Number,
    nationality: String,
    occupation: String,
    dailyLifestyle: String
}, { _id: false });

const languageSchema = new mongoose.Schema({
    primaryLanguage: String,
    secondaryLanguage: String
}, { _id: false });

const agencySchema = new mongoose.Schema({
    name: String,
    idNumber: String,
    currentStatus: String,
    wouldChange: Boolean,
    preferredAgency: String
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
    startDate: Date,
    durationYears: Number,
    durationMonths: Number
}, { _id: false });

const childSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    daytimeStatus: String,
    specialNeeds: [String],
    temperaments: [String],
    interests: [String],
    about: { type: String, maxlength: 500 }
}, { _id: false });

const scheduleActivitySchema = new mongoose.Schema({
    time: String,
    activity: String
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
    activities: [scheduleActivitySchema]
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema
}, { _id: false });

const locationSchema = new mongoose.Schema({
    zipCode: String,
    state: String,
    city: String,
    aboutArea: { type: String, maxlength: 500 }
}, { _id: false });

// PairConnect Specific Schema
const pairConnectSchema = new mongoose.Schema({
    dietaryPreferences: [String],
    requiredAuPair: {
        agency: String,
        country: String,
        driving: Boolean,
        experience: String,
        language: String
    },
    optionalAuPair: {
        interests: [String],
        languages: [String],
        temperaments: [String]
    }
}, { _id: false });

// PairHaven Specific Schema
const pairHavenSchema = new mongoose.Schema({
    aboutFamily: { type: String, maxlength: 500 },
    spaceInHome: { type: String, maxlength: 500 },
    roomStatus: String
}, { _id: false });

// Host Family Schema
const hostFamilySchema = new mongoose.Schema({
    isPairConnect: { type: Boolean, default: false },
    isPairHaven: { type: Boolean, default: false },
    familyStructure: String,
    firstParent: parentSchema,
    secondParent: parentSchema,
    languages: languageSchema,
    agency: agencySchema,
    availability: availabilitySchema,
    numberOfChildren: Number,
    children: [childSchema],
    schedule: scheduleSchema,
    religion: String,
    pets: [String],
    location: locationSchema,
    benefits: [String],
    householdAtmosphere: String,
    profilePhoto: String,
    galleryPhotos: [String],
    pairConnectData: pairConnectSchema,
    pairHavenData: pairHavenSchema
}, { _id: false, timestamps: true });

// Main User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    contactNo: {
        type: String,
        required: false,
        unique: true,
        trim: true
    },
    isHostFamily: {
        type: Boolean,
        default: false
    },
    isAuPair: {
        type: Boolean,
        default: false
    },
    hostFamily: {
        type: hostFamilySchema,
        required: false
    },
    otp: {
        type: String,
        required: false,
        trim: true,
        match: [/^\d{5}$/, 'OTP must be a 5-digit number']
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    mobileOtp: {
        type: String,
        required: false,
        trim: true,
        match: [/^\d{5}$/, 'OTP must be a 5-digit number']
    },
    mobileOtpExpires: {
        type: Date,
        required: false
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;