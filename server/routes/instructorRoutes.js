const express = require('express');
const router = express.Router();
const Instructor = require('../models/Instructor');

// CREATE Instructor
router.post('/', async (req, res) => {
    try {
        const instructor = new Instructor(req.body);
        const savedInstructor = await instructor.save();
        res.status(201).json(savedInstructor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all instructors
router.get('/', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// UPDATE instructor by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedInstructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedInstructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        res.json(updatedInstructor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE instructor by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedInstructor = await Instructor.findByIdAndDelete(req.params.id);

        if (!deletedInstructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        res.json({ message: 'Instructor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});