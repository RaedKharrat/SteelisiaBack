import { validationResult } from 'express-validator';
import Categorie from '../models/Categorie.js';

// Controller function to create a new category
export function addOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const categoryData = {
        name: req.body.name,
    };

    Categorie.create(categoryData)
        .then((newCategorie) => {
            res.status(201).json(newCategorie); // Return the newly created category
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error creating category: ' + err.message });
        });
}

// Controller function to update a category by ID
export function updateOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {
        name: req.body.name,
    };

    Categorie.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
        .then((updatedCategorie) => {
            if (!updatedCategorie) {
                return res.status(404).json({ message: 'Categorie not found' });
            }
            res.json(updatedCategorie); // Return the updated category
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error updating category: ' + err.message });
        });
}

// Controller function to get all categories
export function getAll(req, res) {
    Categorie.find()
        .then((categories) => {
            res.json(categories);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving categories: ' + err.message });
        });
}

// Controller function to get a category by ID
export function getOneById(req, res) {
    Categorie.findById(req.params.id)
        .then((foundCategorie) => {
            if (!foundCategorie) {
                return res.status(404).json({ message: 'Categorie not found' });
            }
            res.json(foundCategorie);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving category: ' + err.message });
        });
}

// Controller function to delete a category by ID
export function deleteOnce(req, res) {
    Categorie.findByIdAndDelete(req.params.id)
        .then((deletedCategorie) => {
            if (!deletedCategorie) {
                return res.status(404).json({ message: 'Categorie not found' });
            }
            res.json({ message: 'Categorie deleted successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error deleting category: ' + err.message });
        });
}
// Controller function to count all products
export function countCategorie(req, res) {
    Categorie.countDocuments()
        .then((count) => {
            res.json({ totalCategories: count }); // Return the total product count
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error counting Categories: ' + err.message });
        });
}