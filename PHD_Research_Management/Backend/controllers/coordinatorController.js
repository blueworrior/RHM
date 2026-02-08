const db = require('../config/db');
const bcrypt = require('bcryptjs');


// CREATE STUDENT
exports.createStudent = async (req, res) => {

    const conn = await db.promise().getConnection();

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            dept_id,
            registration_no,
            research_area,
            enrollment_date
        } = req.body;

        if (!first_name || !last_name || !email || !password || !dept_id || !registration_no || !research_area || !enrollment_date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await conn.beginTransaction();

        // email unique check
        const [emailCheck] = await conn.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (emailCheck.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: "Email already exists" });
        }

        // registration check
        const [regCheck] = await conn.query(
            'SELECT id FROM students WHERE registration_no = ?',
            [registration_no]
        );

        if (regCheck.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: "Registration number already exists" });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        // role_id = 4 (student)
        const [userResult] = await conn.query(
            `INSERT INTO users (role_id, first_name, last_name, email, password)
             VALUES (?, ?, ?, ?, ?)`,
            [4, first_name, last_name, email, hashedPass]
        );

        const user_id = userResult.insertId;

        await conn.query(
            `INSERT INTO students
            (user_id, dept_id, registration_no, research_area, enrollment_date)
            VALUES (?, ?, ?, ?, ?)`,
            [user_id, dept_id, registration_no, research_area, enrollment_date]
        );

        await conn.commit();

        res.status(201).json({
            message: "Student added successfully",
            user_id
        });

    } catch (err) {

        await conn.rollback();

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Duplicate entry detected" });
        }

        console.error(err);
        res.status(500).json({ message: "Server Error" });

    } finally {
        conn.release();
    }
};

//////////////////////////////////////////////////////////////
// GET DEPARTMENt STUDENTS
//////////////////////////////////////////////////////////////
exports.getMyDepartmentStudents = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [rows] = await connection.query(`
            SELECT 
                st.id,
                st.registration_no,
                st.research_area,
                st.enrollment_date,

                u.first_name,
                u.last_name,
                u.email,

                CONCAT(supU.first_name,' ',supU.last_name) AS supervisor

            FROM students st
            JOIN users u ON st.user_id = u.id

            LEFT JOIN supervisors sup ON st.supervisor_id = sup.id
            LEFT JOIN users supU ON sup.user_id = supU.id

            WHERE st.dept_id = ?
            ORDER BY u.first_name
        `, [coord.dept_id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

//////////////////////////////////////////////////////////////
// GET UNASSIGNED STUDENTS
//////////////////////////////////////////////////////////////
exports.getUnassignedStudents = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [rows] = await connection.query(`
            SELECT
                st.id AS student_id,
                u.first_name,
                u.last_name,
                u.email,
                st.registration_no,
                st.research_area,
                st.enrollment_date
            FROM students st
            JOIN users u ON st.user_id = u.id
            WHERE st.dept_id = ?
            AND st.supervisor_id IS NULL
            ORDER BY u.first_name
        `, [coord.dept_id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// UPDATE STUDENTS
//////////////////////////////////////////////////////////////
exports.updateStudent = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const { student_id, research_area, registration_no } = req.body;
        const user_id = req.user.id;

        if (!student_id)
            return res.status(400).json({ message: "Student id required" });

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [result] = await connection.query(`
            UPDATE students
            SET research_area = ?, registration_no = ?
            WHERE id = ?
            AND dept_id = ?
        `, [research_area, registration_no, student_id, coord.dept_id]);

        if (result.affectedRows === 0)
            return res.status(403).json({ message: "You cannot update this student" });

        res.json({ message: "Student updated successfully" });

    } catch (err) {

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Registration number already exists" });
        }

        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// DELETE STUDENT (TRANSACTION)
//////////////////////////////////////////////////////////////

exports.deleteStudent = async (req, res) => {

    const conn = await db.promise().getConnection();

    try {

        const { student_id } = req.params;
        const coordinator_id = req.user.id;

        await conn.beginTransaction();

        const [[coord]] = await conn.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [coordinator_id]
        );

        if (!coord) {
            await conn.rollback();
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const [[student]] = await conn.query(
            `SELECT user_id FROM students
             WHERE id = ? AND dept_id = ?`,
            [student_id, coord.dept_id]
        );

        if (!student) {
            await conn.rollback();
            return res.status(403).json({ message: "You cannot delete this student" });
        }

        await conn.query(
            'DELETE FROM users WHERE id = ?',
            [student.user_id]
        );

        await conn.commit();

        res.json({ message: "Student deleted successfully" });

    } catch (err) {

        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });

    } finally {
        conn.release();
    }
};


//////////////////////////////////////////////////////////////
// GET DEPARTMENT SUPERVISOR
//////////////////////////////////////////////////////////////
exports.getMyDepartmentSupervisors = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [rows] = await connection.query(`
            SELECT
                s.id AS supervisor_id,
                u.first_name,
                u.last_name,
                s.designation,
                s.expertise
            FROM supervisors s
            JOIN users u ON s.user_id = u.id
            WHERE s.dept_id = ?
            ORDER BY u.first_name
        `, [coord.dept_id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


//////////////////////////////////////////////////////////////
// ASSIGN SUPERVISOR (DEPARTMENT SAFE)
//////////////////////////////////////////////////////////////

exports.assignSupervisor = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const { student_id, supervisor_id } = req.body;
        const coordinator_id = req.user.id;

        if (!student_id || !supervisor_id) {
            return res.status(400).json({ message: "Student and Supervisor id required" });
        }

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [coordinator_id]
        );

        if (!coord) {
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const dept_id = coord.dept_id;

        const [[student]] = await connection.query(
            'SELECT id FROM students WHERE id = ? AND dept_id = ?',
            [student_id, dept_id]
        );

        if (!student) {
            return res.status(403).json({ message: "Student not in your department" });
        }

        const [[supervisor]] = await connection.query(
            'SELECT id FROM supervisors WHERE id = ? AND dept_id = ?',
            [supervisor_id, dept_id]
        );

        if (!supervisor) {
            return res.status(403).json({ message: "Supervisor not in your department" });
        }

        await connection.query(
            `UPDATE students
             SET supervisor_id = ?
             WHERE id = ?`,
            [supervisor_id, student_id]
        );

        res.json({ message: "Supervisor assigned successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// REMOVE SUPERVISOR
//////////////////////////////////////////////////////////////

exports.removeSupervisor = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ message: "Student id required" });
        }

        const [notAssign] = await connection.query(
            `SELECT *
             FROM students
             WHERE id = ?`,
            [student_id]
        );

        if (notAssign.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (notAssign[0].supervisor_id === null) {
            return res.status(400).json({ message: "Student already has no supervisor" });
        }

        await connection.query(
            `UPDATE students
             SET supervisor_id = NULL
             WHERE id = ?`,
            [student_id]
        );


        res.json({ message: "Supervisor removed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// GET DEPARTMENT PUBLICATIONS
//////////////////////////////////////////////////////////////
exports.getDepartmentPublications = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const user_id = req.user.id;

        // 1. Get coordinator dept
        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord) return res.status(403).json({ message: "Not a coordinator" });

        // 2. Get publications
        const [rows] = await connection.query(`
            SELECT
                p.id AS publication_id,
                p.title,
                p.journal_name,
                p.year,
                p.type,
                s.registration_no,
                CONCAT(u.first_name, ' ', u.last_name) AS student_name
            FROM publications p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.dept_id = ?
            ORDER BY p.year DESC
        `, [coord.dept_id]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

//////////////////////////////////////////////////////////////
// ASSIGN EXAMINER (FULL TRANSACTION)
//////////////////////////////////////////////////////////////
exports.assignExaminer = async (req, res) => {

    const conn = await db.promise().getConnection();

    try {

        const coordinator_id = req.user.id;
        const { thesis_id, examiner_id } = req.body;

        await conn.beginTransaction();

        const [[coord]] = await conn.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [coordinator_id]
        );

        if (!coord) {
            await conn.rollback();
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const dept_id = coord.dept_id;

        const [thesis] = await conn.query(
            `SELECT t.id
             FROM thesis t
             JOIN students s ON t.student_id = s.id
             WHERE t.id = ?
             AND s.dept_id = ?
             AND t.is_locked = FALSE`,
            [thesis_id, dept_id]
        );

        if (!thesis.length) {
            await conn.rollback();
            return res.status(409).json({ message: "Invalid thesis" });
        }

        const [[examiner]] = await conn.query(
            `SELECT id FROM examiners
             WHERE id = ? AND dept_id = ?`,
            [examiner_id, dept_id]
        );

        if (!examiner) {
            await conn.rollback();
            return res.status(409).json({ message: "Examiner not in department" });
        }

        const [[count]] = await conn.query(
            `SELECT COUNT(*) AS total
             FROM examiner_assignments
             WHERE thesis_id = ?`,
            [thesis_id]
        );

        if (count.total >= 3) {
            await conn.rollback();
            return res.status(409).json({ message: "Max 3 examiners allowed" });
        }
        const [[duplicate]] = await conn.query(
            `SELECT id 
             FROM examiner_assignments
             WHERE thesis_id = ? AND examiner_id = ?`,
            [thesis_id, examiner_id]
        );

        if (duplicate) {
            await conn.rollback();
            return res.status(409).json({ message: "Same examiner already assigned to this thesis" });
        }

        await conn.query(
            `INSERT INTO examiner_assignments (thesis_id, examiner_id)
             VALUES (?, ?)`,
            [thesis_id, examiner_id]
        );

        await conn.query(
            `UPDATE thesis
             SET status = 'Under_Examination'
             WHERE id = ?`,
            [thesis_id]
        );

        await conn.commit();

        res.json({ message: "Examiner assigned successfully" });

    } catch (err) {

        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });

    } finally {
        conn.release();
    }
};

//////////////////////////////////////////////////////////////
// GET EVALUATED THESIS
//////////////////////////////////////////////////////////////
exports.getEvaluatedTheses = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [rows] = await connection.query(`
            SELECT 
                t.id AS thesis_id,
                t.title,
                t.status,
                t.version,
                t.submitted_at,

                s.registration_no,
                CONCAT(u.first_name,' ',u.last_name) AS student_name,

                COUNT(DISTINCT eg.examiner_id) AS total_evaluations

            FROM thesis t
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN examiner_grades eg
                ON eg.thesis_id = t.id
                AND eg.thesis_version = t.version

            WHERE s.dept_id = ?
            GROUP BY t.id
            ORDER BY t.submitted_at DESC
        `, [coord.dept_id]);

        res.json({
            total: rows.length,
            theses: rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// GET THESIS EVALUATIONS
//////////////////////////////////////////////////////////////
exports.getThesisEvaluations = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;
        const thesis_id = req.params.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not a coordinator" });

        const [evals] = await connection.query(`
            SELECT
                eg.thesis_id,
                t.version,
                eg.grade,
                eg.remarks,
                eg.created_at,
                CONCAT(u.first_name,' ',u.last_name) AS examiner_name
            FROM examiner_grades eg
            JOIN thesis t ON eg.thesis_id = t.id
            JOIN students s ON t.student_id = s.id
            JOIN examiners e ON eg.examiner_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE s.dept_id = ?
            AND eg.thesis_version = t.version
            AND eg.thesis_id = ?
            ORDER BY eg.created_at DESC
        `, [coord.dept_id, thesis_id]);

        res.json({
            total: evals.length,
            evaluations: evals
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// GET READY THESIS
//////////////////////////////////////////////////////////////
exports.getReadyThesis = async (req, res) => {

    const connection = await db.promise().getConnection();

    try {

        const user_id = req.user.id;

        const [[coord]] = await connection.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [user_id]
        );

        if (!coord)
            return res.status(403).json({ message: "Not coordinator" });

        const [rows] = await connection.query(`
            SELECT 
                t.id,
                t.title,
                t.version,
                u.first_name,
                u.last_name,
                s.registration_no
            FROM thesis t
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.dept_id = ?
            AND t.ready_for_final = TRUE
            AND t.is_locked = FALSE
        `, [coord.dept_id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

//////////////////////////////////////////////////////////////
// FINALIZE THESIS (VERY IMPORTANT TRANSACTION)
//////////////////////////////////////////////////////////////

exports.finalizeThesis = async (req, res) => {

    const conn = await db.promise().getConnection();

    try {

        const coordinator_id = req.user.id;
        const thesis_id = req.params.id;
        const { status, remarks } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await conn.beginTransaction();

        const [[coord]] = await conn.query(
            'SELECT dept_id FROM coordinators WHERE user_id = ?',
            [coordinator_id]
        );

        if (!coord) {
            await conn.rollback();
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const [[thesis]] = await conn.query(
            `SELECT t.version
             FROM thesis t
             JOIN students s ON t.student_id = s.id
             WHERE t.id = ?
             AND s.dept_id = ?
             AND t.ready_for_final = TRUE`,
            [thesis_id, coord.dept_id]
        );

        if (!thesis) {
            await conn.rollback();
            return res.status(403).json({ message: "Invalid thesis state" });
        }

        await conn.query(
            `UPDATE thesis
             SET status = ?, is_locked = ?
             WHERE id = ?`,
            [
                status === 'Approved' ? 'Approved_Final' : status,
                status === 'Approved',
                thesis_id
            ]
        );

        await conn.query(
            `INSERT INTO approvals
            (reference_type, reference_id, approval_role, approved_by, status, remarks, thesis_version)
            VALUES ('thesis', ?, 'Coordinator', ?, ?, ?, ?)`,
            [thesis_id, coordinator_id, status, remarks || null, thesis.version]
        );

        await conn.query(
            `UPDATE examiner_assignments
             SET is_active = FALSE
             WHERE thesis_id = ?`,
            [thesis_id]
        );

        await conn.commit();

        res.json({ message: `Thesis ${status} successfully` });

    } catch (err) {

        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });

    } finally {
        conn.release();
    }
};
