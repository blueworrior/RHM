const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const coordinatorController = require('../controllers/coordinatorController');

// STUDENTS
// -> 1. create sttudent
router.post('/students', auth, role(['coordinator']), coordinatorController.createStudent);
// -> 2. assign supervisor to student
router.put('/assign-supervisor', auth, role(['coordinator']), coordinatorController.assignSupervisor);
// -> 3. list supervisors of my department
router.get('/my-supervisors', auth, role(['coordinator']), coordinatorController.getMyDepartmentSupervisors);
// -> 4. list students of my department
router.get('/my-students', auth, role(['coordinator']), coordinatorController.getMyDepartmentStudents);
// -> 5. list students without supervisor
router.get('/unassigned-students', auth, role(['coordinator']), coordinatorController.getUnassignedStudents);
// -> 6. remove supervisor
router.put('/remove-supervisor', auth, role(['coordinator']), coordinatorController.removeSupervisor);
// -> 7. update student
router.put('/students', auth, role(['coordinator']), coordinatorController.updateStudent);
// -> 8. delete student
router.delete('/students/:student_id', auth, role(['coordinator']), coordinatorController.deleteStudent);

// -> 9. PUBLICATION (list all my department student )
router.get('/publications', auth, role(['coordinator']), coordinatorController.getDepartmentPublications);

// -> 10 ASSIGN EXAMINER
router.post('/assign-examiner', auth, role(['coordinator']), coordinatorController.assignExaminer);

// -> 11 GET thesis with evaluations
router.get('/thesis/evaluated', auth, role(['coordinator']), coordinatorController.getEvaluatedTheses);
// -> 12 Get Thesis Evaluations
router.get('/thesis/:id/evaluations', auth, role(['coordinator']), coordinatorController.getThesisEvaluations);
// -> 13 Get Ready thesis
router.get('/thesis/ready', auth, role(['coordinator']), coordinatorController.getReadyThesis); 
// -> 14 Decide Thesis
router.put('/thesis/:id/final-decision', auth, role(['coordinator']), coordinatorController.finalizeThesis);

module.exports = router;