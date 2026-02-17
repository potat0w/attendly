require('dotenv').config();
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    console.log('🔍 Connecting to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    let client;
    
    try {
        client = await pool.connect();
        console.log('✅ Connected to database successfully!\n');

        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('✅ Schema file loaded\n');

        console.log('🔨 Executing schema (creating tables)...');
        await client.query(schema);

        console.log('\n✅ Tables created successfully:');
        console.log('  - teachers');
        console.log('  - students');
        console.log('  - courses');
        console.log('  - enrollments');
        console.log('  - sessions');
        console.log('  - attendance');
        console.log('\n✅ Indexes created successfully');
        console.log('\n🎉 Database initialization complete!');

    } catch (error) {
        console.error('\n❌ Database initialization failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('\n🔌 Connection released');
        }
        await pool.end();
        console.log('🔌 Pool closed');
    }
}

console.log('🚀 Starting database initialization script...\n');

initializeDatabase()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed with error');
        process.exit(1);
    });

