const mongoose = require('mongoose');

const experienceAndSkillsSchema = new mongoose.Schema({
    skills: {
        type: [String],
        required: false,
    }
}, { _id: false });

const myProfileInformationSchema = new mongoose.Schema({
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
}, { _id: false });

const parentInformationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    showInPublicity: {
        type: Boolean,
        default: false
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
    }
}, { _id: false });

const languageSchema = new mongoose.Schema({
    primaryLanguage: {
        type: String,
        required: false
    },
    secondaryLanguage: {
        type: String,
        required: false
    }
}, { _id: false });

const agencySchema = new mongoose.Schema({
    agencyName: {
        type: String,
        required: false
    },
    agencyNumber: {
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
    preferredAgency: {
        type: String,
        required: false
    }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
    availableFrom: {
        type: Date,
        required: false
    },
    durationYears: {
        type: Number,
        required: false
    },
    durationMonths: {
        type: Number,
        required: false
    }
}, { _id: false });

const childTemperamentSchema = new mongoose.Schema({
    tags: {
        type: [String],
        required: false
    }
}, { _id: false });

const childInterestsSchema = new mongoose.Schema({
    interests: {
        type: [String],
        required: false
    }
}, { _id: false });

const childSchema = new mongoose.Schema({
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
    daytimeStatus: {
        type: String,
        required: false
    },
    specialNeeds: {
        type: [String],
        required: false
    },
    temperament: {
        type: childTemperamentSchema,
        required: false
    },
    interests: {
        type: childInterestsSchema,
        required: false
    },
    about: {
        type: String,
        maxlength: 500,
        required: false
    }
}, { _id: false });

const scheduleActivitySchema = new mongoose.Schema({
    time: {
        type: String,
        required: false
    },
    activity: {
        type: String,
        required: false
    }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
    activities: {
        type: [scheduleActivitySchema],
        required: false
    }
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
    monday: {
        type: dayScheduleSchema,
        required: false
    },
    tuesday: {
        type: dayScheduleSchema,
        required: false
    },
    wednesday: {
        type: dayScheduleSchema,
        required: false
    },
    thursday: {
        type: dayScheduleSchema,
        required: false
    },
    friday: {
        type: dayScheduleSchema,
        required: false
    },
    saturday: {
        type: dayScheduleSchema,
        required: false
    },
    sunday: {
        type: dayScheduleSchema,
        required: false
    }
}, { _id: false });

const dietaryPreferencesSchema = new mongoose.Schema({
    preferences: {
        type: [String],
        required: false
    }
}, { _id: false });

const religionSchema = new mongoose.Schema({
    faith: {
        type: String,
        required: false
    }
}, { _id: false });

const petsSchema = new mongoose.Schema({
    hasPets: {
        type: Boolean,
        required: false
    },
    petTypes: {
        type: [String],
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
    aboutArea: {
        type: String,
        maxlength: 500,
        required: false
    }
}, { _id: false });

const benefitsSchema = new mongoose.Schema({
    benefits: {
        type: [String],
        required: false
    }
}, { _id: false });

const householdAtmosphereSchema = new mongoose.Schema({
    atmosphereType: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
}, { _id: false });

const familyPhotoSchema = new mongoose.Schema({
    mainPhoto: {
        type: String,
        required: false
    },
    galleryPhotos: {
        type: [String],
        required: false,
        default: []
    }
}, { _id: false });

const pairHeavenSchema = new mongoose.Schema({
    familyProfile: {
        type: String,
        maxlength: 500,
        required: false
    },
    firstParents: {
        type: parentInformationSchema,
        required: false
    },
    secondParents: {
        type: parentInformationSchema,
        required: false
    },
    languages: {
        type: languageSchema,
        required: false
    },
    agency: {
        type: agencySchema,
        required: false
    },
    availability: {
        type: availabilitySchema,
        required: false
    },
    numberOfChildren: {
        type: Number,
        required: false
    },
    children: {
        type: [childSchema],
        required: false
    },
    schedule: {
        type: scheduleSchema,
        required: false
    },
    dietaryPreferences: {
        type: dietaryPreferencesSchema,
        required: false
    },
    religion: {
        type: religionSchema,
        required: false
    },
    pets: {
        type: petsSchema,
        required: false
    },
    location: {
        type: locationSchema,
        required: false
    },
    benefits: {
        type: benefitsSchema,
        required: false
    },
    householdAtmosphere: {
        type: householdAtmosphereSchema,
        required: false
    },
    familyPhotos: {
        type: familyPhotoSchema,
        required: false
    }
}, { _id: false });

const pairConnectSchema = new mongoose.Schema({
    myProfileInformation: {
        type: myProfileInformationSchema,
        required: false
    },
    agency: {
        type: agencySchema,
        required: false
    },
    language: {
        type: languageSchema,
        required: false
    },
    availability: {
        type: availabilitySchema,
        required: false
    },
    location: {
        type: locationSchema,
        required: false
    },
    experienceAndSkills: {
        type: experienceAndSkillsSchema,
        required: false
    },
    temperament: {
        type: childTemperamentSchema,
        required: false
    },
    religion: {
        type: religionSchema,
        required: false
    },
    pets: {
        type: petsSchema,
        required: false
    },
    familyPhotos: {
        type: familyPhotoSchema,
        required: false
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
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
    },
    pairConnectEnabled: {
        type: Boolean
    },
    pairConnectData: {
        type: pairConnectSchema,
        required: false
    },
    pairHeavenEnabled: {
        type: Boolean
    },
    pairHeavenData: {
        type: pairHeavenSchema,
        required: false
    }
}, { _id: false, timestamps: true });

const hostFamilySchema = new mongoose.Schema({
    user: {
        type: userSchema,
        required: true
    },
}, { timestamps: true });

const HostFamily = mongoose.model('HostFamily', hostFamilySchema);

module.exports = HostFamily;
