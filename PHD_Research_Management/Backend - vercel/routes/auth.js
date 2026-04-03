const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// LOGIN
router.post('/login', authController.login);
router.get('/verify', auth, authController.verifyToken);

module.exports = router;
