const db = require('../config/db');
const bcrypt = require('bcryptjs');


// CREATE ADMIN (SUPER ADMIN ONLY)
exports.createAdmin = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        // 🔐 only super admin allowed
        if (!req.user?.is_super_admin) {
            return res.status(403).json({
                message: "Only Super Admin can create admins"
            });
        }

        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        await connection.beginTransaction();

        // check email
        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const [result] = await connection.query(`
            INSERT INTO users
            (role_id, first_name, last_name, email, password, is_super_admin)
            VALUES (1, ?, ?, ?, ?, false)
        `, [first_name, last_name, email, hashPass]);

        await connection.commit();

        res.status(201).json({
            message: "Admin created successfully",
            user_id: result.insertId
        });

    } catch (err) {

        await connection.rollback();
        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    } finally {
        connection.release();
    }
};

// USERS
exports.getAllUsers = async (req, res) => {

    try {

        let query = `
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.status,
                u.is_super_admin,
                r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `;

        // ✅ If NOT super admin → hide super admin
        if (!req.user.is_super_admin) {
            query += ` WHERE u.is_super_admin = false`;
        }

        query += ` ORDER BY r.name ASC`;

        const [rows] = await db.promise().query(query);

        res.json(rows);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Server Error"
        });

    }
};

exports.resetUserPassword = async (req, res) => {

    try {

        const { userId } = req.params;
        const { password } = req.body;

        // ✅ check if super admin
        const [user] = await db.promise().query(
            'SELECT is_super_admin FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user[0].is_super_admin) {
            return res.status(403).json({
                message: "Super Admin password cannot be reset"
            });
        }

        const hashPass = await bcrypt.hash(password, 10);

        await db.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashPass, userId]
        );

        res.json({
            message: "Password reset successfully"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    }
};

// soft delete
exports.toggleUserStatus = async (req, res) => {

    try {

        const { userId } = req.params;
        const { status } = req.body;

        if (req.user.id == userId) {
            return res.status(403).json({
                message: "You cannot deactivate your own account"
            });
        }

        const [user] = await db.promise().query(
            'SELECT is_super_admin, status FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user[0].is_super_admin) {
            return res.status(403).json({
                message: "Super Admin cannot be deactivated"
            });
        }

        if (user[0].status === status) {
            return res.status(403).json({
                message: `User is already ${status}`
            });
        }

        await db.promise().query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );

        res.json({
            message: `User ${status} successfully`
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    }
};


// DEPARTMENTS
exports.createDepartment = async (req, res) => {

    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Department name is required'
            });
        }

        const [existing] = await db.promise().query(
            'SELECT id FROM departments WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Department already exists"
            });
        }

        const [result] = await db.promise().query(
            'INSERT INTO departments (name) VALUES (?)',
            [name]
        );

        res.status(201).json({
            message: "Department Created Successfully",
            department_id: result.insertId
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    }
};


exports.getDepartments = async (req, res) => {

    try {

        const [rows] = await db.promise().query(
            `SELECT id, name FROM departments ORDER BY name`
        );

        res.json(rows);

    } catch (err) {

        res.status(500).json({ message: "Server Error" });

    }
};

exports.updateDepartment = async (req, res) => {

    try {

        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        // check duplicate
        const [existing] = await db.promise().query(
            'SELECT id FROM departments WHERE name = ? AND id != ?',
            [name, id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Department already exists"
            });
        }

        const [result] = await db.promise().query(
            'UPDATE departments SET name = ? WHERE id = ?',
            [name, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.json({
            message: "Department updated successfully"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    }
};

exports.deleteDepartment = async (req, res) => {

    try {

        const { id } = req.params;

        // check usage in students
        const [students] = await db.promise().query(
            'SELECT id FROM students WHERE dept_id = ? LIMIT 1',
            [id]
        );

        if (students.length > 0) {
            return res.status(400).json({
                message: "Cannot delete department assigned to students"
            });
        }

        const [result] = await db.promise().query(
            'DELETE FROM departments WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.json({
            message: "Department deleted successfully"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    }
};




// CREATE COORDINATOR (TRANSACTION)
exports.createCoordinator = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const { first_name, last_name, email, password, dept_id } = req.body;

        if (!first_name || !last_name || !email || !password || !dept_id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await connection.beginTransaction();

        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const [user] = await connection.query(`
            INSERT INTO users
            (role_id, first_name, last_name, email, password)
            VALUES (2, ?, ?, ?, ?)
        `, [first_name, last_name, email, hashPass]);

        await connection.query(`
            INSERT INTO coordinators (user_id, dept_id)
            VALUES (?, ?)
        `, [user.insertId, dept_id]);

        await connection.commit();

        res.status(201).json({
            message: "Coordinator Created Successfully",
            user_id: user.insertId
        });

    } catch (err) {

        await connection.rollback();
        console.error(err);

        res.status(500).json({ message: "Server Error" });

    } finally {
        connection.release();
    }
};



exports.getCoordinator = async (req, res) => {

    try {

        const [rows] = await db.promise().query(`
            SELECT 
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                d.name AS department
            FROM users u
            JOIN coordinators c ON u.id = c.user_id
            JOIN departments d ON c.dept_id = d.id
            ORDER BY u.first_name
        `);

        res.json(rows);

    } catch {

        res.status(500).json({ message: "Server Error" });
    }
};




// CREATE SUPERVISOR (TRANSACTION)
exports.createSupervisor = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            dept_id,
            designation,
            expertise
        } = req.body;

        if (!first_name || !last_name || !email || !password || !dept_id || !designation || !expertise) {
            return res.status(400).json({ message: "All fields required" });
        }

        await connection.beginTransaction();

        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const [user] = await connection.query(`
            INSERT INTO users
            (role_id, first_name, last_name, email, password)
            VALUES (3, ?, ?, ?, ?)
        `, [first_name, last_name, email, hashPass]);

        await connection.query(`
            INSERT INTO supervisors
            (user_id, dept_id, designation, expertise)
            VALUES (?, ?, ?, ?)
        `, [user.insertId, dept_id, designation, expertise]);

        await connection.commit();

        res.status(201).json({
            message: "Supervisor created successfully",
            user_id: user.insertId
        });

    } catch (err) {

        await connection.rollback();
        console.error(err);

        res.status(500).json({ message: "Server Error" });

    } finally {
        connection.release();
    }
};



exports.getSupervisor = async (req, res) => {

    try {

        const [rows] = await db.promise().query(`
            SELECT
                s.id AS supervisor_id,
                u.first_name,
                u.last_name,
                u.email,
                d.name AS department
            FROM users u
            JOIN supervisors s ON s.user_id = u.id
            JOIN departments d ON s.dept_id = d.id
            ORDER BY u.first_name
        `);

        res.json(rows);

    } catch {

        res.status(500).json({ message: "Server Error" });
    }
};




// STUDENTS LIST
exports.getAllStudents = async (req, res) => {

    try {

        const [rows] = await db.promise().query(`
            SELECT 
                students.id,
                students.registration_no,
                students.research_area,
                students.enrollment_date,
                users.first_name,
                users.last_name,
                users.email,
                departments.name AS department_name,
                CONCAT(supUsers.first_name, ' ', supUsers.last_name) AS supervisor
            FROM students
            JOIN users ON students.user_id = users.id
            JOIN departments ON students.dept_id = departments.id
            LEFT JOIN supervisors ON students.supervisor_id = supervisors.id
            LEFT JOIN users AS supUsers ON supervisors.user_id = supUsers.id
        `);

        res.json(rows);

    } catch {

        res.status(500).json({ message: "Server Error" });
    }
};


// CREATE EXAMINER (TRANSACTION)
exports.createExaminer = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const { first_name, last_name, email, password, dept_id, designation } = req.body;

        if (!first_name || !last_name || !email || !password || !dept_id || !designation) {
            return res.status(400).json({ message: "All fields required" });
        }

        await connection.beginTransaction();

        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const [user] = await connection.query(`
            INSERT INTO users
            (role_id, first_name, last_name, email, password)
            VALUES (5, ?, ?, ?, ?)
        `, [first_name, last_name, email, hashPass]);

        await connection.query(`
            INSERT INTO examiners (user_id, dept_id, designation)
            VALUES (?, ?, ?)
        `, [user.insertId, dept_id, designation]);

        await connection.commit();

        res.status(201).json({
            message: "Examiner Created successfully",
            user_id: user.insertId
        });

    } catch (err) {

        await connection.rollback();
        console.error(err);

        res.status(500).json({ message: "Server Error" });

    } finally {
        connection.release();
    }
};



exports.getExaminer = async (req, res) => {

    try {

        const [rows] = await db.promise().query(`
            SELECT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                d.name AS department
            FROM users u
            JOIN examiners e ON u.id = e.user_id
            JOIN departments d ON e.dept_id = d.id
        `);

        res.json(rows);

    } catch {

        res.status(500).json({ message: "Server Error" });
    }
};
