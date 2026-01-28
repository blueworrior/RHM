const express = require('express');
const router = express.Router();
const examinerController = require('../controllers/examinerController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// 1. see assign thesis
router.get('/thesis', auth, role('examiner'), examinerController.getMyAssignedTheses);
// 2. final decide thesis
router.put('/thesis/:id/decision', auth, role('examiner'), examinerController.decideThesis);


module.exports = router;
