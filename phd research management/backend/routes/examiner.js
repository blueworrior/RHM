const express = require('express');
const router = express.Router();
const examinerController = require('../controllers/examinerController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// 1. see assign thesis
router.get('/thesis', auth, role('examiner'), examinerController.getMyAssignedTheses);
// 2. Evaluate Thesis
router.post('/thesis/evaluate', auth, role('examiner'), examinerController.evaluateThesis);



module.exports = router;
