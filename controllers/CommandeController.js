import PDFDocument from 'pdfkit';
import Commande from "../models/Commande.js";
import Product from "../models/Product.js";
import { JSDOM } from "jsdom"; // Use to generate HTML content
import inlineCss from "inline-css"; // To inline CSS for PDF rendering
import mongoose from 'mongoose';  // Import mongoose


// Create a new commande (order)




// Create a new commande (order)

export const createCommande = async (req, res) => {
    const { userId, products } = req.body;

    // Validation for missing fields
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: userId or products' });
    }

    try {
        let totalAmount = 0;
        const productsDetails = [];

        // Fetch all the products at once to reduce database queries
        const productIds = products.map(item => new mongoose.Types.ObjectId(item.productId)); // Using `new` keyword to create ObjectId
        const foundProducts = await Product.find({ _id: { $in: productIds } });

        // Check if all products are found
        if (foundProducts.length !== products.length) {
            return res.status(404).json({ error: 'One or more products not found.' });
        }

        // Calculate the total price of the order
        for (const item of products) {
            const product = foundProducts.find(p => p._id.toString() === item.productId);
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

        // Create the new order (commande)
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



// Generate PDF for a single commande

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

        // Set up table header
        const startX = doc.x; // Save the current X position
        const tableTop = doc.y; // Save the current Y position

        // Draw table headers
        const headers = ['Product', 'Quantity', 'Price'];
        const headerWidths = [80, 80, 80]; // Column widths
        doc.fontSize(14).fillColor('#fff').rect(startX, tableTop, headerWidths.reduce((a, b) => a + b), 25).fill('#4e342e');
        
        headers.forEach((header, i) => {
            doc.fontSize(14).fillColor('#fff').text(header, startX + (headerWidths[i] * i) + 10, tableTop + 5);
        });

        doc.moveDown(1); // Move down for the table body

        // Draw table data rows
        const rowHeight = 30;
        let yPosition = tableTop + 30;
        const alternatingColor = ['#f7f7f7', '#ffffff']; // Alternating row colors

        commande.products.forEach((item, index) => {
            const bgColor = alternatingColor[index % 2];
            doc.rect(startX, yPosition, headerWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);

            // Product name in the first column
            doc.fontSize(12).fillColor('#333').text(item.productId.name, startX + 10, yPosition + 8);
            
            // Quantity in the second column
            doc.text(item.quantity, startX + headerWidths[0] + 10, yPosition + 8);
            
            // Price in the third column
            doc.text(` Dt ${item.productId.prix.toFixed(2)}`, startX + headerWidths[0] + headerWidths[1] + 10, yPosition + 8);

            yPosition += rowHeight; // Move to the next row
        });

        // Draw table borders
        doc.rect(startX, tableTop, headerWidths.reduce((a, b) => a + b), rowHeight * (commande.products.length + 1))
            .lineWidth(1)
            .strokeColor('#ddd')
            .stroke();

        // Draw vertical borders for the columns
        doc.moveTo(startX + headerWidths[0], tableTop)
            .lineTo(startX + headerWidths[0], yPosition)
            .strokeColor('#ddd')
            .lineWidth(1)
            .stroke();

        doc.moveTo(startX + headerWidths[0] + headerWidths[1], tableTop)
            .lineTo(startX + headerWidths[0] + headerWidths[1], yPosition)
            .strokeColor('#ddd')
            .lineWidth(1)
            .stroke();

        doc.moveTo(startX + headerWidths[0] + headerWidths[1] + headerWidths[2], tableTop)
            .lineTo(startX + headerWidths[0] + headerWidths[1] + headerWidths[2], yPosition)
            .strokeColor('#ddd')
            .lineWidth(1)
            .stroke();

        // Total amount section
        doc.moveDown(2).fontSize(18).fillColor('orange').text('Total Amount:', { align: 'right' });
        doc.fontSize(26).fillColor('#000').text(`$${commande.totalAmount.toFixed(2)}`, { align: 'right' });

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
