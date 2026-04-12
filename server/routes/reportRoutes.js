const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Package = require('../models/Package');
const YogaClass = require('../models/YogaClass');
const Attendance = require('../models/Attendance');
const Instructor = require('../models/Instructor');

// Package Sales Report
router.get('/package-sales', async (req, res) => {
    try {
        const sales = await Sale.find();

        const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);

        res.json({
            totalSalesCount: sales.length,
            totalSalesAmount,
            sales
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Instructor Report
router.get('/instructor-performance', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        const classes = await YogaClass.find();
        const attendanceRecords = await Attendance.find();

        const report = instructors.map(instructor => {
            const instructorClasses = classes.filter(
                yogaClass => yogaClass.instructorId === instructor.instructorId
            );

            let totalCheckIns = 0;

            instructorClasses.forEach(yogaClass => {
                attendanceRecords.forEach(record => {
                    if (record.classId === yogaClass.classId) {
                        totalCheckIns += record.customerIds.length;
                    }
                });
            });

            return {
                instructorId: instructor.instructorId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                classes: instructorClasses.map(c => ({
                    classId: c.classId,
                    day: c.day,
                    time: c.time,
                    classType: c.classType
                })),
                totalCheckIns
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Report
router.get('/customer-status', async (req, res) => {
    try {
        const customers = await Customer.find();
        const sales = await Sale.find();

        const report = customers.map(customer => {
            const customerSales = sales.filter(sale => sale.customerId === customer.customerId);

            return {
                customerId: customer.customerId,
                firstName: customer.firstName,
                lastName: customer.lastName,
                classBalance: customer.classBalance,
                packages: customerSales.map(sale => ({
                    packageId: sale.packageId,
                    validityStartDate: sale.validityStartDate,
                    validityEndDate: sale.validityEndDate
                }))
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Teacher Payment Report
router.get('/teacher-payments', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        const classes = await YogaClass.find();
        const attendanceRecords = await Attendance.find();

        const report = instructors.map(instructor => {
            const instructorClasses = classes.filter(
                yogaClass => yogaClass.instructorId === instructor.instructorId
            );

            let totalPayment = 0;

            const classDetails = instructorClasses.map(yogaClass => {
                let checkIns = 0;

                attendanceRecords.forEach(record => {
                    if (record.classId === yogaClass.classId) {
                        checkIns += record.customerIds.length;
                    }
                });

                totalPayment += yogaClass.payRate;

                return {
                    classId: yogaClass.classId,
                    day: yogaClass.day,
                    time: yogaClass.time,
                    payRate: yogaClass.payRate,
                    checkIns
                };
            });

            return {
                instructorId: instructor.instructorId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                totalPayment,
                classes: classDetails
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;