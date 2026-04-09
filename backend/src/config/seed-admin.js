const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  await connection.query('USE audit_fup_db');

  const password_hash = await bcrypt.hash('admin123', 10);
  
  await connection.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['System Admin', 'admin@auditfup.com', password_hash, 'admin']
  );

  console.log('Admin user created: admin@auditfup.com / admin123');
  await connection.end();
}

createAdmin().catch(console.error);