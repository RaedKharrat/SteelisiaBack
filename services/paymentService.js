// services/paymentService.js
const axios = require('axios');
require('dotenv').config();

/**
 * Create a payment using Konnect API
 * @param {number} amount - The payment amount
 * @param {string} currency - The payment currency (e.g., "USD", "TND")
 * @param {string} description - A description of the payment
 * @returns {Promise<Object>} - The payment URL or error details
 */
const createPayment = async (amount, currency, description) => {
    try {
        const response = await axios.post(
            'https://api.konnect.network/api/v1/payments',
            {
                amount,
                currency,
                description,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.KONNECT_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { success: true, paymentUrl: response.data.paymentUrl };
    } catch (error) {
        console.error('Error creating payment:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

module.exports = { createPayment };