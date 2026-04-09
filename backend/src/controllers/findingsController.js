const pool = require('../config/db');

const generateRefId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `IA-${year}${month}-${random}`;
};

const getAllFindings = async (req, res) => {
  try {
    const { status, risk_level, department, search } = req.query;
    
    let query = `
      SELECT f.*, u.name as owner_name, c.name as creator_name
      FROM findings f
      LEFT JOIN users u ON f.owner_id = u.id
      LEFT JOIN users c ON f.created_by = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }
    if (risk_level) {
      query += ' AND f.risk_level = ?';
      params.push(risk_level);
    }
    if (department) {
      query += ' AND f.department = ?';
      params.push(department);
    }
    if (search) {
      query += ' AND (f.finding LIKE ? OR f.ref_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const [findings] = await pool.query(query, params);
    res.json(findings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch findings' });
  }
};

const getFindingById = async (req, res) => {
  try {
    const [findings] = await pool.query(
      `SELECT f.*, u.name as owner_name, u.email as owner_email, c.name as creator_name
       FROM findings f
       LEFT JOIN users u ON f.owner_id = u.id
       LEFT JOIN users c ON f.created_by = c.id
       WHERE f.id = ?`,
      [req.params.id]
    );
    
    if (findings.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    const [comments] = await pool.query(
      'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.finding_id = ? ORDER BY c.created_at DESC',
      [req.params.id]
    );
    
    res.json({ ...findings[0], comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch finding' });
  }
};

const createFinding = async (req, res) => {
  try {
    const { finding, risk_level, owner_id, department, due_date, description, recommendation } = req.body;
    
    const ref_id = generateRefId();
    
    const [result] = await pool.query(
      `INSERT INTO findings (ref_id, finding, risk_level, owner_id, department, due_date, description, recommendation, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ref_id, finding, risk_level || 'Medium', owner_id || null, department, due_date, description, recommendation, req.user.id]
    );
    
    const [newFinding] = await pool.query('SELECT * FROM findings WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newFinding[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create finding' });
  }
};

const updateFinding = async (req, res) => {
  try {
    const { finding, risk_level, owner_id, department, due_date, status, description, recommendation, evidence_path } = req.body;
    
    await pool.query(
      `UPDATE findings 
       SET finding = ?, risk_level = ?, owner_id = ?, department = ?, due_date = ?, status = ?, description = ?, recommendation = ?, evidence_path = ?
       WHERE id = ?`,
      [finding, risk_level, owner_id, department, due_date, status, description, recommendation, evidence_path, req.params.id]
    );
    
    const [updated] = await pool.query('SELECT * FROM findings WHERE id = ?', [req.params.id]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update finding' });
  }
};

const deleteFinding = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM findings WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    res.json({ message: 'Finding deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete finding' });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO comments (finding_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, comment]
    );
    
    const [newComment] = await pool.query(
      'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [[total]] = await pool.query('SELECT COUNT(*) as count FROM findings');
    const [[open]] = await pool.query("SELECT COUNT(*) as count FROM findings WHERE status = 'Open'");
    const [[inProgress]] = await pool.query("SELECT COUNT(*) as count FROM findings WHERE status = 'In Progress'");
    const [[pendingVerification]] = await pool.query("SELECT COUNT(*) as count FROM findings WHERE status = 'Pending Verification'");
    const [[closed]] = await pool.query("SELECT COUNT(*) as count FROM findings WHERE status = 'Closed'");
    const [[pastDue]] = await pool.query("SELECT COUNT(*) as count FROM findings WHERE due_date < CURDATE() AND status != 'Closed'");
    
    const [byRisk] = await pool.query(`
      SELECT risk_level, COUNT(*) as count 
      FROM findings 
      WHERE status != 'Closed' 
      GROUP BY risk_level
    `);
    
    const [byDepartment] = await pool.query(`
      SELECT department, COUNT(*) as count 
      FROM findings 
      WHERE status != 'Closed' 
      GROUP BY department
    `);
    
    const [byMonth] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM findings 
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 12
    `);
    
    res.json({
      total: total.count,
      open: open.count,
      inProgress: inProgress.count,
      pendingVerification: pendingVerification.count,
      closed: closed.count,
      pastDue: pastDue.count,
      byRisk,
      byDepartment,
      byMonth
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = {
  getAllFindings,
  getFindingById,
  createFinding,
  updateFinding,
  deleteFinding,
  addComment,
  getDashboardStats
};