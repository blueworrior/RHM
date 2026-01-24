const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const coordinatorController = require('../controllers/coordinatorController');

// create sttudent
router.post('/students', auth, role(['coordinator']), coordinatorController.createStudent);

// assign supervisor to student
router.put('/assign-supervisor', auth, role(['coordinator']), coordinatorController.assignSupervisor);

// list supervisors of my department
router.get('/my-supervisors', auth, role(['coordinator']), coordinatorController.getMyDepartmentSupervisors);

// list students of my department
router.get('/my-students', auth, role(['coordinator']), coordinatorController.getMyDepartmentStudents);

// list students without supervisor
router.get('/unassigned-students', auth, role(['coordinator']), coordinatorController.getUnassignedStudents);

// remove supervisor
router.put('/remove-supervisor', auth, role(['coordinator']), coordinatorController.removeSupervisor);

// update student
router.put('/students', auth, role(['coordinator']), coordinatorController.updateStudent);

// delete student
router.delete('/students/:student_id', auth, role(['coordinator']), coordinatorController.deleteStudent);


module.exports = router;