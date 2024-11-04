import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const otpSchema = new Schema(
    {
        userId: {
            type: String,
            required: true, // Required field for user ID
        },
        otp: {
            type: String,
            required: true, // Required field for OTP
        },
        expires: {
            type: Date,
            default: Date.now, // This will be set to the current date/time by default
            expires: '30m', // This specifies the document should expire 30 minutes after creation
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default model('Otp', otpSchema);
