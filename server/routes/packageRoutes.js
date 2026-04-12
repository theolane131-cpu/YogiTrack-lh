const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// CREATE package
router.post('/', async (req, res) => {
    try {
        const newPackage = new Package(req.body);
        const savedPackage = await newPackage.save();
        res.status(201).json(savedPackage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json(packages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE package by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json(updatedPackage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE package by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);

        if (!deletedPackage) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;