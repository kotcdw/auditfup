const express = require('express');
const router = express.Router();
const { 
  getAllFindings, 
  getFindingById, 
  createFinding, 
  updateFinding, 
  deleteFinding,
  addComment,
  getDashboardStats 
} = require('../controllers/findingsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/', getAllFindings);
router.get('/:id', getFindingById);
router.post('/', createFinding);
router.put('/:id', updateFinding);
router.delete('/:id', deleteFinding);
router.post('/:id/comments', addComment);

module.exports = router;