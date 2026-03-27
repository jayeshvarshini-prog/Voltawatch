const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres.mcwlxuudwslzkzfljgqc:i3Y8UTibFxzJPUgV@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
});

async function applySeed() {
  try {
    console.log('📝 Reading seed.sql...');
    const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');

    console.log('🌱 Loading production data to Supabase...');
    await pool.query(seed);

    console.log('✅ Seed data loaded successfully!');

    // Verify data
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const cars = await pool.query('SELECT COUNT(*) FROM cars');
    const telemetry = await pool.query('SELECT COUNT(*) FROM telemetry_readings');

    console.log('\n📊 Data Summary:');
    console.log('  - Users:', users.rows[0].count);
    console.log('  - Cars:', cars.rows[0].count);
    console.log('  - Telemetry Readings:', telemetry.rows[0].count);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applySeed();
