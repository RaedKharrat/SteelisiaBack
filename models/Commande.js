import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Defining the Commande schema
const commandeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who placed the order
        required: true,
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product', // Reference to the products in the order
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'canceled'],
        default: 'pending',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    adressLiv: {
        type: String,
        required: false,
    },
    note: {
        type: String,
        required: false,
    },Fullname: {
        type: String,
        required: false,
    },
    numtel: {
        type: String,
        required: false,
    },
    mail: {
        type: String,
        required: false,
    },
    payedAmount: {
        type: Number,
        required: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the 'Commande' model using the schema
export default model('Commande', commandeSchema);
