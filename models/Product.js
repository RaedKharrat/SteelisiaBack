import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    prix: {
        type: Number,
        required: true,
    },
    etat: {
        type: String,
        enum: ['disponible', 'non disponible', 'coming soon'],
        required: true,
    },
    qnt: {
        type: String,
        required: true,
    },
    images: [{ // Change to an array for multiple images
        type: String,
        required: true,
    }],
    idCategorie: {
        type: Schema.Types.ObjectId,
        ref: 'Categorie',
        required: false,
    },
}, {
    timestamps: true,
});

// Creating and exporting the 'Product' model using the defined schema
export default model('Product', productSchema);
