const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../db');

async function createMigrationsTable(client) {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (error) {
        console.error('Error creating migrations table:', error);
        throw error;
    }
}

async function getExecutedMigrations(client) {
    try {
        const result = await client.query('SELECT name FROM migrations ORDER BY id');
        return result.rows.map(row => row.name);
    } catch (error) {
        console.error('Error getting executed migrations:', error);
        throw error;
    }
}

async function markMigrationAsExecuted(client, migrationName) {
    try {
        await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [migrationName]
        );
    } catch (error) {
        console.error('Error marking migration as executed:', error);
        throw error;
    }
}

async function runMigrations() {
    const client = await pool.connect();
    try {
        // Start transaction
        await client.query('BEGIN');

        // Create migrations table if it doesn't exist
        await createMigrationsTable(client);

        // Get list of executed migrations
        const executedMigrations = await getExecutedMigrations(client);
        console.log('Already executed migrations:', executedMigrations);

        // Read and execute migrations
        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const files = await fs.readdir(migrationsDir);
        
        // Sort files to ensure they run in order
        const sqlFiles = files
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log('Found migration files:', sqlFiles);
        
        for (const file of sqlFiles) {
            // Skip if migration has already been executed
            if (executedMigrations.includes(file)) {
                console.log(`Skipping already executed migration: ${file}`);
                continue;
            }

            console.log(`Executing migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = await fs.readFile(filePath, 'utf8');
            
            try {
                await client.query(sql);
                await markMigrationAsExecuted(client, file);
                console.log(`Successfully executed migration: ${file}`);
            } catch (error) {
                console.error(`Error executing migration ${file}:`, error);
                throw error;
            }
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('All migrations completed successfully');
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

// Run migrations
runMigrations().catch(console.error); 