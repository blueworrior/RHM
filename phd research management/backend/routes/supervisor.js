const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const supervisorProposal = require('../controllers/supervisorController');

// Proposals
// -> 1. List Student proposal
router.get('/proposals', auth, role(['supervisor']), supervisorProposal.getMyStudentProposals);

// -> 2. Appprove / Reject Proposal
router.put('/proposals/:id/decision', auth, role(['supervisor']), supervisorProposal.decideProposal);


// PROGRESS REPORTS
// -> 1. List student progress REports
router.get('/progress-reports', auth, role(['supervisor']), supervisorProposal.getStudentProgressReports);

// -> 2. Approve/ Reject Progress Report
router.put('/progress-reports/:id/decision', auth, role(['supervisor']), supervisorProposal.decideProgressReport);


module.exports = router;