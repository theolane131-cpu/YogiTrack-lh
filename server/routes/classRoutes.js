const express = require('express');
const router = express.Router();
const YogaClass = require('../models/YogaClass');

// Converts different time formats like 10am, 10:00am, 10:00 am, 10AM
// into one consistent format: 10:00 AM
const normalizeTime = (time) => {
    if (!time) return '';

    let cleaned = time.toString().trim().toUpperCase();
    cleaned = cleaned.replace(/\s+/g, '');

    const match = cleaned.match(/^(\d{1,2})(?::?(\d{2}))?(AM|PM)$/);

    if (!match) {
        return time;
    }

    let hour = match[1];
    const minutes = match[2] || '00';
    const period = match[3];

    hour = hour.padStart(2, '0');

    return `${hour}:${minutes} ${period}`;
};

// Helper function for checking schedule conflicts
const checkScheduleConflict = async (classData, excludeId = null) => {
    const { classId, instructorId, day, classType } = classData;
    const time = normalizeTime(classData.time);

    if (!classId || !instructorId || !day || !time || !classType) {
        return {
            hasConflict: true,
            message: 'Missing required scheduling information. Please provide class ID, instructor, day, time, and class type.'
        };
    }

    const baseQuery = excludeId ? { _id: { $ne: excludeId } } : {};

    // Rule 1: Prevent duplicate class ID
    const duplicateClassId = await YogaClass.findOne({
        ...baseQuery,
        classId
    });

    if (duplicateClassId) {
        return {
            hasConflict: true,
            message: `Class ID conflict: Class ID ${classId} already exists. Please use a unique Class ID.`
        };
    }

    // Rule 2: Only one class can occur at a specific day and time
    const sameTimeClass = await YogaClass.findOne({
        ...baseQuery,
        day,
        time
    });

    if (sameTimeClass) {
        return {
            hasConflict: true,
            message: `Schedule conflict: ${sameTimeClass.classId} is already scheduled on ${day} at ${time}. Please choose a different day or time.`
        };
    }

    // Rule 3: Prevent same instructor from being double-booked
    const instructorConflict = await YogaClass.findOne({
        ...baseQuery,
        instructorId,
        day,
        time
    });

    if (instructorConflict) {
        return {
            hasConflict: true,
            message: `Instructor conflict: Instructor ${instructorId} is already assigned to ${instructorConflict.classId} on ${day} at ${time}.`
        };
    }

    // Rule 4: Prevent duplicate-style class entry
    const duplicateStyleClass = await YogaClass.findOne({
        ...baseQuery,
        instructorId,
        day,
        time,
        classType
    });

    if (duplicateStyleClass) {
        return {
            hasConflict: true,
            message: `Duplicate class warning: A ${classType} class with instructor ${instructorId} already exists on ${day} at ${time}.`
        };
    }

    return {
        hasConflict: false,
        message: ''
    };
};

// CREATE class
router.post('/', async (req, res) => {
    try {
        req.body.time = normalizeTime(req.body.time);

        const conflictCheck = await checkScheduleConflict(req.body);

        if (conflictCheck.hasConflict) {
            return res.status(400).json({
                error: conflictCheck.message
            });
        }

        const newClass = new YogaClass(req.body);
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all classes
router.get('/', async (req, res) => {
    try {
        const classes = await YogaClass.find().sort({ day: 1, time: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE class by ID
router.put('/:id', async (req, res) => {
    try {
        req.body.time = normalizeTime(req.body.time);

        const conflictCheck = await checkScheduleConflict(req.body, req.params.id);

        if (conflictCheck.hasConflict) {
            return res.status(400).json({
                error: conflictCheck.message
            });
        }

        const updatedClass = await YogaClass.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(updatedClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE class by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedClass = await YogaClass.findByIdAndDelete(req.params.id);

        if (!deletedClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;