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



export function deleteCommande(req, res) {
    Commande.findByIdAndDelete(req.params.id)
        .then((deletedCommande) => {
            if (!deletedCommande) {
                return res.status(404).json({ message: 'Commande not found' });
            }
            res.json({ message: 'Commande deleted successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error deleting Commande: ' + err.message });
        });
}
// Count total commandes
export const countCmd = async (req, res) => {
    try {
        const totalCommands = await Commande.countDocuments(); // Count total number of commandes in the database
        res.status(200).json({ totalCommands }); // Return the count of commandes
    } catch (err) {
        res.status(500).json({ error: 'Error counting commandes: ' + err.message });
    }
};

//stat
// Count all shipped commandes
export const countShippedCmd = async (req, res) => {
    try {
        const shippedCount = await Commande.countDocuments({ status: 'shipped' }); // Count all commandes with status 'shipped'
        res.status(200).json({ shippedCount }); // Return the count of shipped commandes
    } catch (err) {
        res.status(500).json({ error: 'Error counting shipped commandes: ' + err.message });
    }
};

// Get all pending commandes
export const getAllPendingCmd = async (req, res) => {
    try {
        const pendingCommandes = await Commande.countDocuments({ status: 'pending' })

        res.status(200).json({pendingCommandes}); // Return all commandes with status 'pending'
    } catch (err) {
        res.status(500).json({ error: 'Error fetching pending commandes: ' + err.message });
    }
};

// Get all canceled commandes
export const getAllCanceledCmd = async (req, res) => {
    try {
        const canceledCommandes = await Commande.countDocuments({ status: 'canceled' })

        res.status(200).json({canceledCommandes}); // Return all commandes with status 'canceled'
    } catch (err) {
        res.status(500).json({ error: 'Error fetching canceled commandes: ' + err.message });
    }
};

// Get all delivered commandes
export const getAllDeliveredCmd = async (req, res) => {
    try {
        const deliveredCommandes = await Commande.countDocuments({ status: 'delivered' })

        res.status(200).json({deliveredCommandes}); // Return all commandes with status 'delivered'
    } catch (err) {
        res.status(500).json({ error: 'Error fetching delivered commandes: ' + err.message });
    }
};

// Sum of all total amounts for commandes with status 'delivered'
export const sumDeliveredCmd = async (req, res) => {
    try {
        const deliveredCommandes = await Commande.aggregate([
            { $match: { status: 'delivered' } }, // Filter commandes with status 'delivered'
            { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } } // Sum the totalAmount of all delivered commandes
        ]);
        res.status(200).json({ totalDeliveredAmount: deliveredCommandes[0]?.totalAmount || 0 }); // Return the sum
    } catch (err) {
        res.status(500).json({ error: 'Error summing delivered commandes: ' + err.message });
    }
};
