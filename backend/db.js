const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_m8KwGUQuLOz7@ep-cold-union-a47hx6do-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database');
    release();
});

// This function should only be called manually when you need to reset/initialize the database
async function resetDatabase() {
    try {
        // Read and execute the SQL file
        const sql = fs.readFileSync(path.join(__dirname, 'update_tables.sql'), 'utf8');
        await pool.query(sql);
        console.log('Database tables reset successfully');
    } catch (error) {
        console.error('Error resetting database tables:', error);
        throw error;
    }
}

// Get a client from the pool for transactions
async function getClient() {
    const client = await pool.connect();
    return client;
}

module.exports = {
    query: async (text, params) => {
        try {
            console.log('Executing query:', text);
            console.log('With parameters:', params);
            const result = await pool.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },
    pool: pool,
    resetDatabase: resetDatabase,
    getClient: getClient  // Add the getClient function to exports
}; 