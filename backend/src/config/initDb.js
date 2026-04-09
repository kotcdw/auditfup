const mysql = require('mysql2/promise');
const { Pool } = require('pg');

const initDatabase = async () => {
  const dbType = process.env.DB_TYPE || 'mysql';
  
  if (dbType === 'postgresql') {
    try {
      const pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'audit_client',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS findings (
          id SERIAL PRIMARY KEY,
          ref_id VARCHAR(20) UNIQUE,
          finding TEXT NOT NULL,
          risk_level VARCHAR(20) DEFAULT 'Medium',
          owner_id INT,
          department VARCHAR(100),
          due_date DATE,
          status VARCHAR(50) DEFAULT 'Open',
          evidence_path VARCHAR(255),
          evidence_files TEXT,
          description TEXT,
          recommendation TEXT,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INT,
          action VARCHAR(100) NOT NULL,
          table_name VARCHAR(50),
          record_id INT,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          finding_id INT NOT NULL,
          user_id INT NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.end();
    } catch (err) {
      console.error('PostgreSQL init error:', err.message);
    }
  } else {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS audit_fup_db`);
    await connection.query(`USE audit_fup_db`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'auditor', 'manager', 'audit_client') DEFAULT 'audit_client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS findings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ref_id VARCHAR(20) UNIQUE,
        finding TEXT NOT NULL,
        risk_level ENUM('Critical', 'High', 'Medium', 'Low') DEFAULT 'Medium',
        owner_id INT,
        department VARCHAR(100),
        due_date DATE,
        status ENUM('Open', 'In Progress', 'Pending Verification', 'Closed') DEFAULT 'Open',
        evidence_path VARCHAR(255),
        evidence_files JSON,
        description TEXT,
        recommendation TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(50),
        record_id INT,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        finding_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.end();
  }

  console.log('Database initialized successfully');
};

if (require.main === module) {
  require('dotenv').config();
  initDatabase().catch(console.error);
}

module.exports = initDatabase;