const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
    },
    connectionTimeoutMillis: 30000, // Increased to 30 seconds
    idleTimeoutMillis: 30000,
    query_timeout: 60000, // Increased to 60 seconds
    statement_timeout: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
});

pool.on('connect', () => {
    console.log('Connected to Supabase PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;

