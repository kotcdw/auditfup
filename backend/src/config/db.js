const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');

const dbType = process.env.DB_TYPE || 'mysql';

let pool;

if (dbType === 'postgresql') {
  const pgPool = new PgPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool = {
    query: async (text, params) => {
      try {
        const result = await pgPool.query(text, params);
        if (result.command === 'SELECT') {
          return [result.rows, { affectedRows: result.rowCount }];
        }
        return [result.rows, { insertId: result.rows[0]?.id || 0, affectedRows: result.rowCount }];
      } catch (err) {
        console.error('PostgreSQL Query Error:', err.message);
        throw err;
      }
    }
  };
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'audit_fup_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool;
module.exports.dbType = dbType;