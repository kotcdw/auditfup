const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { dbType } = require('../config/db');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const p = dbType === 'postgresql' ? '$1' : '?';
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ' + p, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    let result;
    if (dbType === 'postgresql') {
      const pgResult = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, password_hash, role || 'audit_client']
      );
      result = [{ insertId: pgResult[0][0]?.id }];
    } else {
      result = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, password_hash, role || 'audit_client']
      );
    }

    const token = jwt.sign(
      { id: result[0].insertId, email, name, role: role || 'audit_client' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result[0].insertId, name, email, role: role || 'audit_client' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const p = dbType === 'postgresql' ? '$1' : '?';
    const [users] = await pool.query('SELECT * FROM users WHERE email = ' + p, [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const p = dbType === 'postgresql' ? '$1' : '?';
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ' + p,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY name'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const p = dbType === 'postgresql' ? '$1' : '?';
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ' + p, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (dbType === 'postgresql') {
      await pool.query(
        'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
        [name, email, role, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const p = dbType === 'postgresql' ? '$1' : '?';
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ' + p, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ' + p, [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const p = dbType === 'postgresql' ? '$1' : '?';
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ' + p, [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    if (dbType === 'postgresql') {
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
    } else {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { register, login, getProfile, getAllUsers, updateUser, deleteUser, changePassword };