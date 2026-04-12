const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    attendanceId: {
        type: String,
        required: true,
        unique: true
    },
    classId: {
        type: String,
        required: true
    },
    instructorId: {
        type: String,
        required: true
    },
    attendanceDate: {
        type: Date,
        required: true
    },
    customerIds: [{
        type: String,
        required: true
    }]
});

module.exports = mongoose.model('Attendance', AttendanceSchema);