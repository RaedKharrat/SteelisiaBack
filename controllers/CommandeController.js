import Commande from "../models/Commande.js";
import Product from "../models/Product.js";

// Create a new commande (order)
export const createCommande = async (req, res) => {
    const { userId, products } = req.body;

    try {
        let totalAmount = 0;
        const productsDetails = [];

        // Calculate the total price of the order
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found.` });
            }
            const totalPrice = product.prix * item.quantity;
            totalAmount += totalPrice;
            productsDetails.push({
                productId: item.productId,
                quantity: item.quantity,
                totalPrice: totalPrice
            });
        }

        const newCommande = new Commande({
            userId,
            products: productsDetails,
            totalAmount,
        });

        await newCommande.save();
        res.status(201).json(newCommande); // Return the newly created commande
    } catch (err) {
        res.status(500).json({ error: 'Error creating commande: ' + err.message });
    }
};

// Get all commandes
export const getAllCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find().populate("userId", "first_name last_name email").populate("products.productId", "name prix");
        res.status(200).json(commandes);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching commandes: ' + err.message });
    }
};

// Get a single commande by ID
export const getCommandeById = async (req, res) => {
    const { id } = req.params;
    try {
        const commande = await Commande.findById(id).populate("userId", "first_name last_name email").populate("products.productId", "name prix");
        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }
        res.status(200).json(commande);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching commande: ' + err.message });
    }
};

// Update a commande
export const updateCommande = async (req, res) => {
    const { id } = req.params;
    const { status, products } = req.body;

    try {
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }

        if (status) commande.status = status; // Update order status if provided
        if (products) commande.products = products; // Update products if provided

        await commande.save();
        res.status(200).json(commande);
    } catch (err) {
        res.status(500).json({ error: 'Error updating commande: ' + err.message });
    }
};

// Delete a commande
export const deleteCommande = async (req, res) => {
    const { id } = req.params;

    try {
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }

        await commande.remove();
        res.status(200).json({ message: 'Commande deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting commande: ' + err.message });
    }
};
// Count total commandes
export const countCmd = async (req, res) => {
    try {
        const totalCommands = await Commande.countDocuments(); // Count total number of commandes in the database
        res.status(200).json({ totalCommands }); // Return the count of commandes
    } catch (err) {
        res.status(500).json({ error: 'Error counting commandes: ' + err.message });
    }
};
