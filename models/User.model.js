const mongoose = require('mongoose');

// Common schemas that can be reused
const parentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    nationality: {
        type: String,
        required: false
    },
    occupation: {
        type: String,
        required: false
    },
    dailyLifestyle: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: false
    }
}, { _id: false });

const agencySchema = new mongoose.Schema({
    agency: {
        type: String,
        required: false
    },
    agencyId: {
        type: String,
        required: false
    },
    currentStatus: {
        type: String,
        required: false
    },
    wouldChangeAgency: {
        type: Boolean,
        required: false
    },
    areYouCurrentlyHosting: {
        type: String,
        required: false
    },
    whichAgency: {
        type: String,
        required: false
    }
}, { _id: false });

const locationSchema = new mongoose.Schema({
    zipCode: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    infoAboutArea: {
        type: String,
        required: false
    }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
    time: {
        type: String,
        required: false
    },
    activity: {
        type: String,
        required: false
    }
}, { _id: false });

const childInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    dayStatus: {
        type: String,
        required: false
    },
    allergy: {
        type: String,
        required: false
    },
    temperaments: {
        type: [String],
        required: false
    },
    interests: {
        type: [String],
        required: false
    },
    aboutYourChild: {
        type: String,
        required: false
    }
}, { _id: false });

// Host Family Schema
const hostFamilySchema = new mongoose.Schema({
    familyStructure: {
        type: String,
        required: false
    },
    firstParent: {
        type: parentSchema,
        required: false
    },
    secondParent: {
        type: parentSchema,
        required: false
    },
    primaryLanguage: {
        type: String,
        required: false
    },
    secondaryLanguage: {
        type: String,
        required: false
    },
    agency: {
        type: agencySchema,
        required: false
    },
    availabilityDate: {
        type: Date,
        required: false
    },
    noOfChildren: {
        type: Number,
        required: false
    },
    children: {
        type: [childInfoSchema],
        required: false
    },
    religion: {
        type: String,
        required: false
    },
    pets: {
        type: [String],
        required: false
    },
    location: {
        type: locationSchema,
        required: false
    },
    benefits: {
        type: [String],
        required: false
    },
    aboutYourFamily: {
        type: String,
        required: false
    },
    spaceInHome: {
        type: String,
        required: false
    },
    householdAtmosphere: {
        type: String,
        required: false
    },
    durationYears: {
        type: Number,
        required: false
    },
    durationMonths: {
        type: Number,
        required: false
    },
    dietaryPref: {
        type: String,
        required: false
    },
    schedule: {
        type: Map,
        of: [dayScheduleSchema],
        required: false
    },
    images: {
        type: [String],
        required: false
    }
}, { _id: false, timestamps: true });

// Au Pair Schema (to be implemented later)
const auPairSchema = new mongoose.Schema({
    // Will be implemented later as per requirements
}, { _id: false, timestamps: true });

// Main User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
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
        trim: true,
        sparse: true
    },
    age: {
        type: Number,
        required: false
    },
    credits: {
        type: Number,
        required: false
    },
    images: {
        type: [String],
        required: false
    },
    profileImage: {
        type: String,
        required: false
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
    auPair: {
        type: auPairSchema,
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

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ contactNo: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

module.exports = User;