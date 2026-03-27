const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres.mcwlxuudwslzkzfljgqc:i3Y8UTibFxzJPUgV@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
});

async function applySchema() {
  try {
    console.log('📝 Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');

    console.log('🔧 Applying schema to Supabase...');
    await pool.query(schema);

    console.log('✅ Schema applied successfully!');

    // Verify tables created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    result.rows.forEach(row => console.log('  -', row.table_name));

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applySchema();
