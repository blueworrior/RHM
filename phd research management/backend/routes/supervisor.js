const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const supervisorProposal = require('../controllers/supervisorController');

router.get('/proposals', auth, role(['supervisor']), supervisorProposal.getMyStudentProposals);

// appprove / reject proposal
router.post('/proposals/:id/decision', auth, role(['supervisor']), supervisorProposal.decideProposal);


module.exports = router;