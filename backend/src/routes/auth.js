const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers, updateUser, deleteUser, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;