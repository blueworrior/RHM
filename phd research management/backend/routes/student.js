const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const uploadProposal = require('../middleware/uploadProposal');
const uploadProgress = require('../middleware/uploadProgress');

const studentController = require('../controllers/studentController');


// PROPOSALS
// -> 1.Submit proposal
router.post(
    '/proposals', 
    auth, 
    role(['student']), 
    uploadProposal.single('proposal_file'), 
    studentController.submitProposal
);
// -> 2. List propsal
router.get('/proposals', auth, role(['student']), studentController.getMyProposals);
// -> 3. view proposal status + remarks
router.get('/proposals/status', auth, role(['student']), studentController.getMyProposalStatus);


// PROGRESS REPORTS
// -> 1. Submit progress report
router.post(
    '/progress-reports',
    auth,
    role(['student']),
    uploadProgress.single('report_file'),
    studentController.submitProgressReport
);
// -> 2. List Progress Report
router.get('/progress-reports', auth, role(['student']), studentController.getMyProgressReport);


// Publication
// -> 1. Add publication
router.post('/publications', auth, role(['student']), studentController.addPublication);
// -> 2. List publication
router.get('/publications', auth, role(['student']), studentController.getMypublication);


module.exports = router;