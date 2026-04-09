const pool = require('../config/db');

const auditLogger = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const recordId = req.params.id || (body ? JSON.parse(body).id : null);
        
        pool.query(
          'INSERT INTO audit_logs (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, action, tableName, recordId, JSON.stringify({ method: req.method, path: req.originalUrl })]
        ).catch(console.error);
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = { auditLogger };