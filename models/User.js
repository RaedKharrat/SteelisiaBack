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
        required: false
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
        required: false
    },
    adresse: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['Admin', 'Client', 'Company Owner'], 
        required: false
    }
}, {
    timestamps: true  // Corrected timestamps option
});

export default model('User', UserSchema);
