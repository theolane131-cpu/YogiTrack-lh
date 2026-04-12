const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const YogaClass = require('../models/YogaClass');
const Customer = require('../models/Customer');

// CREATE attendance
router.post('/', async (req, res) => {
    try {
        const {
            attendanceId,
            classId,
            instructorId,
            attendanceDate,
            customerIds
        } = req.body;

        // Check class exists
        const selectedClass = await YogaClass.findOne({ classId });
        if (!selectedClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check instructor matches class
        if (selectedClass.instructorId !== instructorId) {
            return res.status(400).json({ error: 'Instructor is not assigned to this class' });
        }

        // Check all customers exist and update balances
        const updatedCustomers = [];

        for (const customerId of customerIds) {
            const customer = await Customer.findOne({ customerId });

            if (!customer) {
                return res.status(404).json({ error: `Customer ${customerId} not found` });
            }

            customer.classBalance -= 1;
            await customer.save();

            updatedCustomers.push({
                customerId: customer.customerId,
                newBalance: customer.classBalance
            });
        }

        // Save attendance
        const newAttendance = new Attendance({
            attendanceId,
            classId,
            instructorId,
            attendanceDate,
            customerIds
        });

        const savedAttendance = await newAttendance.save();

        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendance: savedAttendance,
            updatedCustomers
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all attendance records
router.get('/', async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find();
        res.json(attendanceRecords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;