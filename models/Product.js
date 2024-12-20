import mongoose from 'mongoose';
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
    oldPrix: { 
        type: Number,
        required: false,
    },
    qnt: {
        type: String,
        required: true,
    },
    images: [{ // Change to an array of base64-encoded strings
        type: String,
        required: true,
    }],
    idCategorie: {
        type: Schema.Types.ObjectId,
        ref: 'Categorie',
        required: false,
    },
    sousCategorie: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
});

export default model('Product', productSchema);
