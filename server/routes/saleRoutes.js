const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Package = require('../models/Package');

// CREATE sale
router.post('/', async (req, res) => {
    try {
        const {
            saleId,
            customerId,
            packageId,
            amountPaid,
            paymentMethod,
            paymentDateTime,
            validityStartDate,
            validityEndDate
        } = req.body;

        // Check customer exists
        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Check package exists
        const selectedPackage = await Package.findOne({ packageId });
        if (!selectedPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // Validate price
        if (amountPaid !== selectedPackage.price) {
            return res.status(400).json({ error: 'Amount paid must match package price' });
        }

        // Create sale
        const newSale = new Sale({
            saleId,
            customerId,
            packageId,
            amountPaid,
            paymentMethod,
            paymentDateTime,
            validityStartDate,
            validityEndDate
        });

        const savedSale = await newSale.save();

        // Update customer balance
        if (selectedPackage.numberOfClasses === 'Unlimited') {
            customer.classBalance = 9999;
        } else {
            customer.classBalance += parseInt(selectedPackage.numberOfClasses);
        }

        await customer.save();

        res.status(201).json({
            message: 'Sale recorded successfully',
            sale: savedSale,
            updatedCustomerBalance: customer.classBalance
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all sales
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;