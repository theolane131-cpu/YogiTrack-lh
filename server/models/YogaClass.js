const mongoose = require('mongoose');

const YogaClassSchema = new mongoose.Schema({
    classId: {
        type: String,
        required: true,
        unique: true
    },
    instructorId: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    time: {
        type: String,
        required: true
    },
    classType: {
        type: String,
        required: true,
        enum: ['General', 'Special']
    },
    payRate: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('YogaClass', YogaClassSchema);