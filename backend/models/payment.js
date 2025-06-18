const db = require('../db');

class Payment {
    static async createPayment(paymentData) {
        const {
            user_id,
            payment_intent_id,
            amount,
            currency,
            status,
            payment_method,
            created_at = new Date()
        } = paymentData;

        try {
            const client = await db.pool.connect();
            try {
                const query = `
                    INSERT INTO payments (
                        user_id,
                        payment_intent_id,
                        amount,
                        currency,
                        status,
                        payment_method,
                        created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                `;
                
                const values = [
                    user_id,
                    payment_intent_id,
                    amount,
                    currency,
                    status,
                    payment_method,
                    created_at
                ];

                const result = await client.query(query, values);
                return result.rows[0];
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error creating payment record:', error);
            throw error;
        }
    }

    static async getPaymentByIntentId(paymentIntentId) {
        try {
            const client = await db.pool.connect();
            try {
                const query = `
                    SELECT * FROM payments 
                    WHERE payment_intent_id = $1
                `;
                const result = await client.query(query, [paymentIntentId]);
                return result.rows[0];
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error fetching payment by intent ID:', error);
            throw error;
        }
    }

    static async getUserPayments(userId) {
        try {
            const client = await db.pool.connect();
            try {
                const query = `
                    SELECT * FROM payments 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC
                `;
                const result = await client.query(query, [userId]);
                return result.rows;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error fetching user payments:', error);
            throw error;
        }
    }
}

module.exports = Payment; 