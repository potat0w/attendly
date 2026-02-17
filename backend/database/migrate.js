require('dotenv').config();
const pool = require('../config/db');

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting database migration...\n');

        console.log('Adding duration_minutes field to sessions table...');
        await client.query(`
            ALTER TABLE sessions 
            ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
        `);
        console.log('✓ duration_minutes field added\n');

        console.log('Creating enrollments table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE (student_id, course_id)
            );
        `);
        console.log('✓ enrollments table created\n');

        console.log('Creating indexes for enrollments table...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
        `);
        console.log('✓ enrollments indexes created\n');

        console.log('✓ Migration completed successfully!');

    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

