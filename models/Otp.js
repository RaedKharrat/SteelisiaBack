import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const otpSchema = new Schema(
    {
        userId: {
            type: String,
            required: true, // Add required if necessary
        },
        otp: {
            type: String,
            required: true, // Add required if necessary
        },
        expires: {
            type: Date,
            default: Date.now,
            expires: '30m', // Expire after 1500 seconds
        },
    },
    {
        timestamps: true, // This will add createdAt and updatedAt timestamps
    }
);

export default model('Otp', otpSchema);
