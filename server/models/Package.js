const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    packageId: {
        type: String,
        required: true,
        unique: true
    },
    packageName: {
        type: String,
        required: true
    },
    packageCategory: {
        type: String,
        enum: ['General', 'Senior'],
        required: true
    },
    numberOfClasses: {
        type: String,
        enum: ['1', '4', '10', 'Unlimited'],
        required: true
    },
    classType: {
        type: String,
        enum: ['General', 'Special'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Package', PackageSchema);