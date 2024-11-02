import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import crypto from 'crypto';
import otpGenerator from 'otp-generator';  
import nodemailer from 'nodemailer';



const JWT_SECRET = crypto.randomBytes(32).toString('hex');

// Login function
export const login = async function (req, res, next) {
    try {
        // Convert the email to lowercase before querying
        const email = req.body.email.toLowerCase();
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'User is not registered' });
        }

        // Verify the password
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Password incorrect' });
        }

        // Set token expiry and create token
        const maxAge = 1 * 60 * 60;
        const token = jwt.sign(
            { userId: user._id, role: user.role, numTel: user.numTel },
            JWT_SECRET,
            { expiresIn: maxAge }
        );

        // Set the cookie with the JWT
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
            secure: true,
        });

        // Respond with success message and token
        res.status(200).json({
            userId: user._id,
            message: "User successfully logged in",
            jwt: token,
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Register function
export const Register = async (req, res) => {
    try {
        console.log('Incoming signup request:', req.body); // Log the request body

        // Hash the password before saving it
        const hash = await bcrypt.hash(req.body.password, 10);
        
        // Check if the user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "It seems you already have an account, please log in instead." });
        }

        // Create a new user
        const user = new User({
            email: req.body.email,
            password: hash,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            adresse: req.body.adresse,
            role: req.body.role || 'Client' // Default role if not provided
        });

        // Save the user to the database
        await user.save();
        return res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in Register:', error);
        return res.status(500).json({ error: error.message });
    }
};


// Forget Password function (OTP generation)
export const forgetPassword = async function (req, res, next) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User is not registered' });
        }

        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        const otpDocument = new Otp({
            userId: email,
            otp,
            createdAt: new Date()  // This will trigger the TTL countdown
        });
        await otpDocument.save();

        // Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `"Support Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Code for Password Reset',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="text-align: center; color: #7a6ad8;">Password Reset Request</h2>
                    <p style="color: #333;">Hello,</p>
                    <p style="color: #333;">We received a request to reset the password for your account. Use the OTP below to proceed:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 20px; background-color: #f1f1f1; border-radius: 5px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="color: #333;">This OTP is valid for the next 30 minutes. If you did not request a password reset, please ignore this email or contact support if you have questions.</p>

                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        © ${new Date().getFullYear()} Steelisia. All rights reserved.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Code reset password was sent to your email' });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// OTP Verification function
export const verifyOtp = async function (req, res, next) {
    try {
        const { email, otp } = req.body;

        // Find the OTP document for the specified email
        const otpRecord = await Otp.findOne({ userId: email });

        // Check if OTP exists for the email
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }

        // Verify if the OTP matches
        if (otpRecord.otp !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // If OTP is correct, remove it from the database (for one-time use)
        await Otp.deleteOne({ userId: email });

        // Proceed to password reset or other next steps
        res.status(200).json({ message: 'OTP verified successfully. Proceed with password reset.' });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Reset Password function
export const resetPassword = async function (req, res, next) {
    try {
        const { email, otp, newPassword } = req.body;

        // Find the OTP document for the specified email
        const otpRecord = await Otp.findOne({ userId: email });

        // Check if OTP exists and matches
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // If OTP is valid, hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in the User model
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        // Delete OTP after successful password reset
        await Otp.deleteOne({ userId: email });

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Logout function
export const logout = (req, res) => {
    // Clear the JWT cookie by setting it with a maxAge of 1 millisecond
    res.cookie("jwt", "", { maxAge: 1, httpOnly: true }); // httpOnly for security
    return res.status(200).json({ message: "User logged out" });
};
