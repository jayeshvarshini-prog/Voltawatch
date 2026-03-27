const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.mcwlxuudwslzkzfljgqc:i3Y8UTibFxzJPUgV@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
});

async function test() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM cars');
    console.log('✅ SUCCESS! Cars count:', result.rows[0].count);
    await pool.end();
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

test();
