import { validationResult } from 'express-validator';
import Product from '../models/Product.js';

// Controller function to create a new product
export function addOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if the images files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one image file is required" });
    }

    // Prepare the product data for creation
    const productData = {
        name: req.body.name,
        description: req.body.description,
        prix: req.body.prix,
        etat: req.body.etat,
        qnt: req.body.qnt,
        images: req.files.map(file => file.filename), // Map filenames from the uploaded files
        idCategorie: req.body.idCategorie,
    };

    Product.create(productData)
        .then((newProduct) => {
            res.status(201).json(newProduct); // Return the newly created product
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error creating product: ' + err.message });
        });
}

// Controller function to update a product by ID
export function updateOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Prepare the update data
    const updateData = {
        name: req.body.name,
        description: req.body.description,
        prix: req.body.prix,
        etat: req.body.etat,
        qnt: req.body.qnt,
        idCategorie: req.body.idCategorie,
    };

    // Handle the images if provided
    if (req.files && req.files.length > 0) {
        updateData.images = req.files.map(file => file.filename); // Update images with new filenames
    }

    Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
        .then((updatedProduct) => {
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(updatedProduct); // Return the updated product
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error updating product: ' + err.message });
        });
}

// Controller function to get all products with category details
export function getAll(req, res) {
    Product.find()
        .populate('idCategorie') // Include category details in the product data
        .then((products) => {
            res.json(products);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving products: ' + err.message });
        });
}

// Controller function to get a product by ID with category details
export function getOneById(req, res) {
    Product.findById(req.params.id)
        .populate('idCategorie') // Include category details in the product data
        .then((foundProduct) => {
            if (!foundProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(foundProduct);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error retrieving product: ' + err.message });
        });
}

// Controller function to delete a product by ID
export function deleteOnce(req, res) {
    Product.findByIdAndDelete(req.params.id)
        .then((deletedProduct) => {
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error deleting product: ' + err.message });
        });
}

// Controller function to count all products
export function countProducts(req, res) {
    Product.countDocuments()
        .then((count) => {
            res.json({ totalProducts: count }); // Return the total product count
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error counting products: ' + err.message });
        });
}
