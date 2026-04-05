const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const superAdminOnly = require('../middleware/superAdminOnly');

const adminController = require('../controllers/adminController');

// Admin
router.post('/admins', auth, role(['admin']), superAdminOnly, adminController.createAdmin);

// users
router.get('/users', auth, role(['admin']), adminController.getAllUsers);
router.put('/users/:userId/reset-password',
    auth,
    role(['admin']),
    adminController.resetUserPassword
);
router.put('/users/:userId/status',
    auth,
    role(['admin']),
    adminController.toggleUserStatus
);


// Department
router.post('/departments', auth, role(['admin']), adminController.createDepartment);
router.get('/departments', auth, role(['admin']), adminController.getDepartments);
router.put('/departments/:id', auth, role(['admin']), adminController.updateDepartment);
router.delete('/departments/:id', auth, role(['admin']), adminController.deleteDepartment);


// Coordinator
router.post('/coordinators', auth, role(['admin']), adminController.createCoordinator);
router.get('/coordinators', auth, role(['admin']), adminController.getCoordinator);
router.put('/coordinators/:user_id', auth, role(['admin']), adminController.updateCoordinator);

// Supervisor
router.post('/supervisors', auth, role(['admin']), adminController.createSupervisor);
router.get('/supervisors', auth, role(['admin']), adminController.getSupervisor);
router.put('/supervisors/:user_id', auth, role(['admin']), adminController.updateSupervisor);

// Students
router.get('/students', auth, role(['admin']), adminController.getAllStudents);

// Examiner
router.post('/examiners', auth, role(['admin']), adminController.createExaminer);
router.get('/examiners', auth, role(['admin']), adminController.getExaminer);
router.put('/examiners/:user_id', auth, role(['admin']), adminController.updateExaminer);

module.exports = router;