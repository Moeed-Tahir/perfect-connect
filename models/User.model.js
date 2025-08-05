const mongoose = require('mongoose');

// =================== BASE SCHEMAS ====================
const LocationModelSchema = new mongoose.Schema({
    zipCode: String,
    state: String,
    city: String,
    infoAboutArea: String,
    country: String,
    nationality: String,
    hostFamilyExpectedLocation: String
}, { _id: false });

const ParentModelSchema = new mongoose.Schema({
    age: Number,
    firstName: String,
    lastName: String,
    nationality: String,
    occupation: String,
    dailyLifestyle: String,
    role: String
}, { _id: false });

const ChildModelSchema = new mongoose.Schema({
    age: Number,
    name: String,
    gender: String,
    dayStatus: String,
    allergy: String,
    specialNeeds: String,  // New Added
    aboutYourChild: String,
    temperaments: [String],
    interests: [String]
}, { _id: false });

const AgencyModelSchema = new mongoose.Schema({
    name: String,
    id: String,
    currentStatus: String,
    whichAgency: String,
    wouldChangeAgency: Boolean,
    areYouCurrentlyHosting: Boolean
}, { _id: false });

const DayScheduleSchema = new mongoose.Schema({
    time: String,
    activity: String
}, { _id: false });

const RequiredAuPairModelSchema = new mongoose.Schema({
    agencyName: String,
    country: String,
    abilityToDrive: String,
    experience: String,
    language: String,
    status: String
}, { _id: false });

const OptionalAuPairModelSchema = new mongoose.Schema({
    interest: String,
    language: String,
    pets: String,
    religion: String,
    temperament: String
}, { _id: false });

// ==================== AU PAIR SCHEMA ====================
const AuPairModelSchema = new mongoose.Schema({
    // Type Flags
    isPairConnect: Boolean,
    isPairHaven: Boolean,
    isPairLink: Boolean,

    // Basic Info
    age: Number,
    firstName: String,
    lastName: String,
    nationality: String,
    areYouFluent: String,
    availabilityDate: String,
    durationMonth: String,
    durationYear: String,
    religion: String,
    whichCountryAreYouFrom: String,
    aboutYourJourney: String,
    aboutYourself: String,
    usingPairLinkFor: String,

    // Lists
    images: [String],
    languages: [String],
    pets: [String],
    expNskills: [String],
    temperament: [String],
    thingsILove: [String],
    whatMakesMeSmile: [String],
    favSpots: [String],

    // Nested Models
    agency: AgencyModelSchema,
    location: LocationModelSchema
}, { _id: false });

// ==================== HOST FAMILY SCHEMA ====================
const HostFamilyModelSchema = new mongoose.Schema({
    // Type Flags
    isPairConnect: Boolean,
    isPairHaven: Boolean,

    // Basic Info
    familyStructure: String,
    primaryLanguage: String,
    secondaryLanguage: String,
    availabilityDate: String,
    durationYear: String,
    durationMonth: String,
    religion: String,
    aboutYourFamily: String,
    familyName: String,
    spaceInHome: String,
    householdAtmosphere: String,
    profileImage: String,

    // Lists
    pets: [String],
    images: [String],
    benefits: [String],
    dietaryPrefs: [String],

    // Children
    noOfChildren: Number,
    children: [ChildModelSchema],

    // Schedule (using Map for dynamic day keys)
    schedule: {
        type: Map,
        of: [DayScheduleSchema]
    },

    // Parents
    firstParent: ParentModelSchema,
    secondParent: ParentModelSchema,

    // Nested Models
    agency: AgencyModelSchema,
    location: LocationModelSchema,

    // Au Pair Preferences
    requiredAuPairModel: RequiredAuPairModelSchema,
    optionalAuPairModel: OptionalAuPairModelSchema
}, { _id: false });

// ==================== MAIN USER SCHEMA ====================
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
        sparse: true,
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
        type: HostFamilyModelSchema,
        required: false
    },
    auPair: {
        type: AuPairModelSchema,
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