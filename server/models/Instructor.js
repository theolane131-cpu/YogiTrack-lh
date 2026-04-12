const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    instructorId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: String,
    email: String,
    preferredCommunication: {
        type: String,
        enum: ['Email', 'Phone', 'Text']
    }
});

module.exports = mongoose.model('Instructor', InstructorSchema);