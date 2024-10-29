import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Client', 'Company Owner'], 
        required: true
    }
}, {
    timestamps: true  // Corrected timestamps option
});

export default model('User', UserSchema);
