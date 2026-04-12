const express = require('express');
const router = express.Router();
const YogaClass = require('../models/YogaClass');

// CREATE class
router.post('/', async (req, res) => {
    try {
        const { day, time } = req.body;

        const existingClass = await YogaClass.findOne({ day, time });

        if (existingClass) {
            return res.status(400).json({
                error: 'Schedule conflict: another class is already scheduled at this day and time.'
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
        const classes = await YogaClass.find();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE class by ID
router.put('/:id', async (req, res) => {
    try {
        const { day, time } = req.body;

        if (day && time) {
            const conflictingClass = await YogaClass.findOne({
                day,
                time,
                _id: { $ne: req.params.id }
            });

            if (conflictingClass) {
                return res.status(400).json({
                    error: 'Schedule conflict: another class is already scheduled at this day and time.'
                });
            }
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