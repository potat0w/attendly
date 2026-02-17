const pool = require('./backend/config/db');

async function fixSessionTimestamps() {
  try {
    console.log('Updating session timestamps to current time...');
    
    // Update all sessions to have current timestamp
    const result = await pool.query(`
      UPDATE sessions 
      SET created_at = CURRENT_TIMESTAMP 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour'
      RETURNING id, created_at, duration_minutes
    `);
    
    console.log(`Updated ${result.rows.length} sessions:`);
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, New created_at: ${row.created_at}, Duration: ${row.duration_minutes} minutes`);
    });
    
    console.log('Session timestamps updated successfully!');
  } catch (error) {
    console.error('Error updating sessions:', error);
  } finally {
    await pool.end();
  }
}

fixSessionTimestamps();
