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
// -> 1. List my student progress REports
router.get('/progress-reports', auth, role(['supervisor']), supervisorProposal.getStudentProgressReports);
// -> 2. Approve/ Reject Progress Report
router.put('/progress-reports/:id/decision', auth, role(['supervisor']), supervisorProposal.decideProgressReport);
//PUblication (list my students publication)
router.get('/publications', auth, role(['supervisor']), supervisorProposal.getMyStudentPublications);


// Thesis
// -> 1. List my student Thesis
router.get('/thesis', auth, role(['supervisor']), supervisorProposal.getMyStudentThesis);
// -> 2. Approve/ Reject thesis
router.put('/thesis/:id/decision', auth, role(['supervisor']), supervisorProposal.decideThesis);

module.exports = router;