import PDFDocument from 'pdfkit';
import Commande from "../models/Commande.js";
import Product from "../models/Product.js";
import mongoose from 'mongoose';  
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


export const createCommande = async (req, res) => {
    console.log("Received request to create a commande:", req.body);

    const { userId, products, adressLiv, note, Fullname, numtel, mail } = req.body;

    // Validate required fields
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
        console.error("Missing required fields:", { userId, products });
        return res.status(400).json({ error: 'Missing required fields: userId or products' });
    }

    try {
        let totalAmount = 0;
        const productsDetails = [];

        // Convert product IDs to Mongoose ObjectId
        const productIds = products.map(item => new mongoose.Types.ObjectId(item.productId));
        console.log("Converted product IDs:", productIds);

        // Fetch products from the database
        const foundProducts = await Product.find({ _id: { $in: productIds } });

        if (foundProducts.length !== products.length) {
            console.error("One or more products not found.");
            return res.status(404).json({ error: 'One or more products not found.' });
        }

        // Calculate total price
        for (const item of products) {
            const product = foundProducts.find(p => p._id.toString() === item.productId);
            if (!product) {
                console.error(`Product with ID ${item.productId} not found.`);
                return res.status(404).json({ error: `Product with ID ${item.productId} not found.` });
            }
            const totalPrice = product.prix * item.quantity;
            totalAmount += totalPrice;
            productsDetails.push({
                productId: item.productId,
                quantity: item.quantity,
                totalPrice,
            });
        }

        console.log("Total amount calculated:", totalAmount);

        // Create a new Commande
        const newCommande = new Commande({
            userId,
            products: productsDetails,
            totalAmount,
            adressLiv,
            note,
            Fullname,
            numtel,
            mail
        });

        await newCommande.save();
        console.log("Commande saved successfully:", newCommande);

        res.status(201).json({
            message: "Commande created successfully.",
            commande: newCommande,
        });

    } catch (err) {
        console.error("Error creating commande:", err);
        res.status(500).json({ error: 'Error creating commande: ' + err.message });
    }
};

// Get all commandes for a specific user
export const getCommandesByUser = async (req, res) => {
    const { userId } = req.params; // Extract userId from request parameters

    try {
        // Find commandes for the specified user and populate related fields
        const userCommandes = await Commande.find({ userId })
            .populate("userId", "first_name last_name email")
            .populate("products.productId", "name prix");

        // If no commandes are found, return an appropriate response
        if (!userCommandes || userCommandes.length === 0) {
            return res.status(404).json({ message: 'No commandes found for the specified user.' });
        }

        // Return the found commandes
        res.status(200).json(userCommandes);
    } catch (err) {
        // Handle errors and send an appropriate response
        res.status(500).json({ error: 'Error fetching commandes for user: ' + err.message });
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

// Cancel a commande
export const cancelCommande = async (req, res) => {
    const { id } = req.params;  // Extract commande id from URL params

    try {
        // Find the commande by id and update its status to 'canceled'
        const commande = await Commande.findByIdAndUpdate(
            id,
            { status: 'canceled' },  // Set the new status
            { new: true }  // Return the updated document
        );

        // If no commande is found, return a 404 error
        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }

        // Return the updated commande with the new status
        res.status(200).json(commande);
    } catch (err) {
        // Handle errors and send an appropriate response
        res.status(500).json({ error: 'Error canceling commande: ' + err.message });
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

export const downloadCommandePdf = async (req, res) => {
    const { id } = req.params;

    try {
        // Retrieve the commande by ID and populate user and products
        const commande = await Commande.findById(id)
            .populate("userId", "first_name last_name email phone adresse")
            .populate("products.productId", "name prix");

        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }

        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        doc.pipe(res);
        res.setHeader('Content-Disposition', `attachment; filename="Commande_${commande._id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Set up fonts and styles for rendering manually
        doc.fontSize(42).fillColor('orange').text('Steelisia', { align: 'center' });
        doc.fontSize(20).fillColor('#000').text('Bon d\'achat', { align: 'center' });

        // Client information section
        doc.moveDown(2).fontSize(20).text('Client Information', { align: 'left' }).moveDown(0.5);
        doc.fontSize(14).text(`Name: ${commande.userId.first_name} ${commande.userId.last_name}`, { align: 'left' });
        doc.text(`Email: ${commande.userId.email}`, { align: 'left' });
        doc.text(`Phone: ${commande.userId.phone || "N/A"}`, { align: 'left' });
        doc.text(`Adresse Livraison: ${commande.userId.adresse || "N/A"}`, { align: 'left' });

        // Order details section
        doc.moveDown(2).fontSize(20).text('Order Details', { align: 'left' }).moveDown(0.5);

        // Table setup dynamically adjusting for width and height
        const startX = doc.x; // Save the current X position
        const tableTop = doc.y; // Save the current Y position

        // Calculate column widths based on content size or page width
        const tableWidth = doc.page.width - 2 * doc.page.margins.left; // Full width available
        const columnCount = 3; // We have 3 columns
        const columnPadding = 10; // Padding between text and column border
        const columnWidth = tableWidth / columnCount; // Dynamic width per column

        // Draw table headers with dynamic widths
        const headers = ['Product', 'Quantity', 'Price'];
        const headerHeight = 25;
        doc.fontSize(14).fillColor('#fff').rect(startX, tableTop, tableWidth, headerHeight).fill('#4e342e');
        
        headers.forEach((header, i) => {
            doc.fontSize(14).fillColor('#fff').text(header, startX + columnWidth * i + columnPadding, tableTop + 5);
        });

        // Move down for table body
        let rowHeight = 30;
        let yPosition = tableTop + headerHeight;

        // Draw table rows dynamically with alternating colors
        const alternatingColor = ['#f7f7f7', '#ffffff']; // Alternating row colors

        commande.products.forEach((item, index) => {
            const bgColor = alternatingColor[index % 2];
            doc.rect(startX, yPosition, tableWidth, rowHeight).fill(bgColor);

            // Product name in the first column
            doc.fontSize(12).fillColor('#333').text(item.productId.name, startX + columnPadding, yPosition + 8);
            
            // Quantity in the second column
            doc.text(item.quantity, startX + columnWidth + columnPadding, yPosition + 8);
            
            // Price in the third column
            doc.text(` Dt ${item.productId.prix.toFixed(2)}`, startX + 2 * columnWidth + columnPadding, yPosition + 8);

            yPosition += rowHeight; // Move to the next row
        });

        // Draw table borders
        doc.rect(startX, tableTop, tableWidth, rowHeight * (commande.products.length + 1))
            .lineWidth(1)
            .strokeColor('#ddd')
            .stroke();

        // Draw vertical borders for columns
        [1, 2].forEach((i) => {
            doc.moveTo(startX + columnWidth * i, tableTop)
                .lineTo(startX + columnWidth * i, yPosition)
                .strokeColor('#ddd')
                .lineWidth(1)
                .stroke();
        });

        // Total amount section
        doc.moveDown(2).fontSize(18).fillColor('orange').text('Total Amount:', { align: 'right' });
        doc.fontSize(26).fillColor('#000').text(`Dt ${commande.totalAmount.toFixed(2)}`, { align: 'right' });

        // Add separator line between content and footer
        const separatorYPosition = doc.page.height - 80; // Adjust the Y position based on content height
        doc.moveTo(doc.page.margins.left, separatorYPosition)
            .lineTo(doc.page.width - doc.page.margins.right, separatorYPosition)
            .lineWidth(1)
            .strokeColor('#4e342e')
            .stroke();

        // Footer section
        const footerHeight = 20;
        const footerYPosition = doc.page.height - footerHeight - doc.page.margins.bottom;
        doc.fontSize(10).fillColor('#4e342e').text('Steelisia - All Rights Reserved', doc.page.width / 2 - 100, footerYPosition, { align: 'center' });

        // End the PDF generation
        doc.end();
    } catch (err) {
        res.status(500).json({ error: 'Error generating PDF: ' + err.message });
    }
};

