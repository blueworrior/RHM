const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const uploadProposal = require('../middleware/uploadProposal');

const studentController = require('../controllers/studentController');

// Submit proposal
router.post('/proposals', auth, role(['student']), uploadProposal.single('proposal_file'), studentController.submitProposal);

// List propsal
router.get('/proposals', auth, role(['student']), studentController.getMyProposals);



module.exports = router;