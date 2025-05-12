const bcrypt = require('bcryptjs');
const db = require('../db');

class User {
    static async createUser(userData) {
        const {
            email,
            username,
            full_name,
            phone_number,
            emergency_number,
            district,
            current_location,
            blood_group,
            password,
            is_volunteer
        } = userData;

        console.log('Creating user with data:', { ...userData, password: '***' });
        console.log('Username value:', username);

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed successfully');

            // Start a transaction
            const client = await db.pool.connect();
            console.log('Database client connected');

            try {
                await client.query('BEGIN');
                console.log('Transaction started');

                // Format current_location as POINT if it's a string
                let formattedLocation = current_location;
                if (typeof current_location === 'string') {
                    const [lat, lng] = current_location.split(',').map(coord => parseFloat(coord.trim()));
                    formattedLocation = `(${lat},${lng})`;
                }

                // Insert user
                const query = {
                    text: `INSERT INTO users (
                        email, username, full_name, phone_number, 
                        district, current_location, blood_group, 
                        password, is_volunteer
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id, email, username, full_name`,
                    values: [
                        email, 
                        username, 
                        full_name, 
                        phone_number,
                        district, 
                        formattedLocation, 
                        blood_group,
                        hashedPassword, 
                        is_volunteer
                    ]
                };

                console.log('Executing query with values:', {
                    ...query,
                    values: query.values.map((v, i) => i === 7 ? '***' : v) // Hide password
                });

                const userResult = await client.query(query);
                console.log('User inserted successfully');

                const user = userResult.rows[0];

                // If emergency number is provided, insert into emergency_contacts
                if (emergency_number) {
                    await client.query(
                        'INSERT INTO emergency_contacts (user_id, emergency_number) VALUES ($1, $2)',
                        [user.id, emergency_number]
                    );
                    console.log('Emergency contact inserted successfully');
                }

                // If user is a volunteer, insert into volunteers table
                if (is_volunteer) {
                    await client.query(
                        'INSERT INTO volunteers (user_id, status) VALUES ($1, $2)',
                        [user.id, 'active']
                    );
                    console.log('Volunteer record inserted successfully');
                }

                await client.query('COMMIT');
                console.log('Transaction committed successfully');
                return user;
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error in transaction:', error);
                throw error;
            } finally {
                client.release();
                console.log('Database client released');
            }
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            console.log('Finding user by email:', email);
            const result = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            console.log('User found:', result.rows[0] ? 'Yes' : 'No');
            return result.rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    }

    static async verifyPassword(user, password) {
        try {
            console.log('Verifying password for user:', user.email);
            const isValid = await bcrypt.compare(password, user.password);
            console.log('Password verification result:', isValid);
            return isValid;
        } catch (error) {
            console.error('Error in verifyPassword:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('Finding user by ID:', id);
            const result = await db.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );
            console.log('User found:', result.rows[0] ? 'Yes' : 'No');
            return result.rows[0];
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    static async updateProfile(userId, updateData) {
        try {
            console.log('Updating user profile:', { userId, updateData });
            
            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');

                // Build the update query dynamically based on provided fields
                const updateFields = [];
                const values = [];
                let paramCount = 1;

                for (const [key, value] of Object.entries(updateData)) {
                    if (value !== undefined) {
                        updateFields.push(`${key} = $${paramCount}`);
                        values.push(value);
                        paramCount++;
                    }
                }

                if (updateFields.length === 0) {
                    throw new Error('No fields to update');
                }

                values.push(userId);
                const query = {
                    text: `UPDATE users 
                           SET ${updateFields.join(', ')}
                           WHERE id = $${paramCount}
                           RETURNING *`,
                    values
                };

                console.log('Executing update query:', {
                    ...query,
                    values: query.values.map(v => typeof v === 'string' ? v.substring(0, 50) + '...' : v)
                });

                const result = await client.query(query);
                await client.query('COMMIT');

                if (result.rows.length === 0) {
                    return null;
                }

                return result.rows[0];
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error in updateProfile transaction:', error);
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw error;
        }
    }
}

module.exports = User; 