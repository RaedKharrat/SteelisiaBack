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
            .populate("userId", "first_name last_name email phone")
            .populate("products.productId", "name prix");

        if (!commande) {
            return res.status(404).json({ error: 'Commande not found' });
        }

        // Create HTML structure with inline CSS for styling
        const htmlContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
                .title {
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                    color: #2e7d32;
                }
                .subtitle {
                    text-align: center;
                    font-size: 20px;
                    color: #555;
                    margin-top: -10px;
                    font-style: italic;
                }
                .header {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #ddd;
                }
                .section {
                    margin-top: 20px;
                }
                .user-info {
                    padding: 15px;
                    border-radius: 8px;
                    background-color: #f7f8fc;
                    border: 1px solid #e1e4e8;
                    margin-bottom: 20px;
                }
                h3 {
                    margin: 0 0 10px 0;
                    color: #555;
                    font-size: 20px;
                }
                p {
                    margin: 5px 0;
                }
                .order-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    background-color: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .order-table th, .order-table td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    font-size: 14px;
                    text-align: left;
                }
                .order-table th {
                    background-color: #f4f4f9;
                    color: #444;
                    font-weight: bold;
                }
                .total {
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    background-color: #e8f5e9;
                    border: 1px solid #c8e6c9;
                    font-size: 18px;
                    color: #2e7d32;
                    text-align: center;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="title">Steelisia</div>
                <div class="subtitle">bon d'achat</div>
        
                <div class="header">Commande Summary</div>
        
                <div class="section user-info">
                    <h3>Client Information</h3>
                    <p><strong>Name:</strong> ${commande.userId.first_name} ${commande.userId.last_name}</p>
                    <p><strong>Email:</strong> ${commande.userId.email}</p>
                    <p><strong>Phone Number:</strong> ${commande.userId.phone || "N/A"}</p>
                </div>
        
                <div class="section order-info">
                    <h3>Order Details</h3>
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commande.products.map((item) => `
                                <tr>
                                    <td>${item.productId.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.totalPrice.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
        
                <div class="section total">
                    <h3>Total Amount</h3>
                    <p><strong>$${commande.totalAmount.toFixed(3)}</strong></p>
                </div>
            </div>
        </body>
        </html>
        `;
        



        // Inline CSS to ensure proper rendering in PDF
        const inlinedHtml = await inlineCss(htmlContent, { url: '/' });

        // Generate PDF from inlined HTML
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        doc.pipe(res);
        res.setHeader('Content-Disposition', `attachment; filename="Commande_${commande._id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Load HTML content into the PDF
        const { window } = new JSDOM(inlinedHtml);
        const document = window.document;

        // Render elements into PDF
        doc.fontSize(20).text(document.querySelector(".header").textContent, { align: "center" });
        doc.moveDown();
        
        const userInfo = document.querySelector(".user-info").textContent.trim();
        doc.fontSize(14).text(userInfo, { align: "left" });
        doc.moveDown();

        const orderInfo = document.querySelector(".order-info").textContent.trim();
        doc.fontSize(14).text(orderInfo, { align: "left" });
        doc.moveDown();

        const totalInfo = document.querySelector(".total").textContent.trim();
        doc.fontSize(14).text(totalInfo, { align: "right" });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: 'Error generating PDF: ' + err.message });
    }
};
