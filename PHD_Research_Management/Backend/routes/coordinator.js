const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const coordinatorController = require('../controllers/coordinatorController');

// STUDENTS
// -> 1. create student
router.post('/students', auth, role(['coordinator']), coordinatorController.createStudent);
// -> 2. list students of my department
router.get('/my-students', auth, role(['coordinator']), coordinatorController.getMyDepartmentStudents);
// -> 3. list students without supervisor
router.get('/unassigned-students', auth, role(['coordinator']), coordinatorController.getUnassignedStudents);
// -> 4 . update student
router.put('/students', auth, role(['coordinator']), coordinatorController.updateStudent);
// -> 5. delete student
router.delete('/students/:student_id', auth, role(['coordinator']), coordinatorController.deleteStudent);

// -> 6. list supervisors of my department
router.get('/my-supervisors', auth, role(['coordinator']), coordinatorController.getMyDepartmentSupervisors);
// -> 7. assign supervisor to student
router.put('/assign-supervisor', auth, role(['coordinator']), coordinatorController.assignSupervisor);
// -> 8. remove supervisor from student
router.put('/remove-supervisor', auth, role(['coordinator']), coordinatorController.removeSupervisor);

// -> 9. PUBLICATION (list all my department student )
router.get('/publications', auth, role(['coordinator']), coordinatorController.getDepartmentPublications);

// -> 10 GET approved thesis (waiting for examiner assignment)
router.get('/thesis/approved', auth, role(['coordinator']), coordinatorController.getApprovedTheses);
// -> 11 GET department examiners
router.get('/examiners', auth, role(['coordinator']), coordinatorController.getDepartmentExaminers);
// -> 12 ASSIGN EXAMINER
router.get('/examiners', auth, role(['coordinator']), coordinatorController.getDepartmentExaminers);

// -> 13 GET thesis with evaluations
router.get('/thesis/evaluated', auth, role(['coordinator']), coordinatorController.getEvaluatedTheses);
// -> 14 Get Thesis Evaluations
router.get('/thesis/:id/evaluations', auth, role(['coordinator']), coordinatorController.getThesisEvaluations);
// -> 15 Get Ready thesis
router.get('/thesis/ready', auth, role(['coordinator']), coordinatorController.getReadyThesis); 
// -> 16 Decide Thesis
router.put('/thesis/:id/final-decision', auth, role(['coordinator']), coordinatorController.finalizeThesis);
// -> 17. GET examiners (for thesis assignment)
router.get('/examiners', auth, role(['coordinator']), coordinatorController.getDepartmentExaminers);

module.exports = router;