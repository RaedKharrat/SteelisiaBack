import { validationResult } from 'express-validator';
import User from '../models/User.js';
import nodemailer from 'nodemailer';





// Controller function to update a user
export function updateUser(req, res) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Prepare the update object
    const updateData = {
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        companyName: req.body.companyName,
        phone: req.body.phone,
        adresse: req.body.adresse,
        role: req.body.role,
    };

    // Check for an image file and add it to updateData
    if (req.file) {
        updateData.image = req.file.filename; // Store only the filename, you may want to store the full path
    }

    // Update user by ID
    User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(updatedUser);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error updating user: ' + err.message });
        });
}

// Controller function to get all users
export function getAllUsers(req, res) {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving users: ' + err.message });
        });
}

// Controller function to get a user by ID
export function getUserById(req, res) {
    User.findById(req.params.id)
        .then((foundUser) => {
            if (!foundUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(foundUser);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving user: ' + err.message });
        });
}

// Controller function to delete a user by ID
export function deleteUser(req, res) {
    User.findByIdAndDelete(req.params.id)
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error deleting user: ' + err.message });
        });
}
export function countUsers(req, res) {
    User.countDocuments()
        .then((count) => {
            res.json({ totalUser: count }); // Return the total product count
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error counting User: ' + err.message });
        });
}