const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration(migrationFile) {
    if (!migrationFile) {
        throw new Error('Migration file path is required');
    }

    const client = await db.pool.connect();
    
    try {
        console.log('Starting migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', migrationFile);
        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found: ${migrationPath}`);
        }
        
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Start transaction
        await client.query('BEGIN');
        
        // Execute the migration
        console.log('Executing migration...');
        await client.query(migrationSQL);
        
        // Commit the transaction
        await client.query('COMMIT');
        console.log('Migration completed successfully!');
        
    } catch (error) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        // Close the pool
        await db.pool.end();
    }
}

// Get migration file path from command line arguments
const migrationFile = process.argv[2];

// Run the migration
runMigration(migrationFile)
    .then(() => {
        console.log('Migration script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    }); 