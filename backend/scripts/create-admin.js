const db = require('../db');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function createAdminUser() {
    try {
        console.log('Starting admin user creation...');

        // Check if admin already exists
        const adminExists = await db.query('SELECT id FROM users WHERE is_admin = true');
        if (adminExists.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const adminData = {
            email: 'admin@gmail.com',
            username: 'admin',
            full_name: 'System Administrator',
            phone_number: '9800000000',
            district: 'Kathmandu',
            password: 'admin@123',
            is_volunteer: false,
            is_admin: true
        };

        const admin = await User.createUser(adminData);
        console.log('Admin user created successfully:', {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            is_admin: admin.is_admin
        });

    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    } finally {
        // Close the database pool
        await db.pool.end();
    }
}

// Run the script
createAdminUser()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 