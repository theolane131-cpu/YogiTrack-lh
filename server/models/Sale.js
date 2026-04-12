const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    saleId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: String,
        required: true
    },
    packageId: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Card', 'Online']
    },
    paymentDateTime: {
        type: Date,
        required: true
    },
    validityStartDate: {
        type: Date,
        required: true
    },
    validityEndDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Sale', SaleSchema);