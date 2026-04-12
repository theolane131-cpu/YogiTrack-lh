const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    customerId: {
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
    address: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    preferredCommunication: {
        type: String,
        enum: ['Email', 'Phone', 'Text']
    },
    classBalance: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);