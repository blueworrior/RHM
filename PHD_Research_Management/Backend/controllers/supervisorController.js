const db = require('../config/db');

// helper query to get supervisor id from user_id
const supsql = `SELECT id FROM supervisors WHERE user_id = ?`;

// --- PROPOSALS ---

// 1. Get my student proposals
exports.getMyStudentProposals = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a Supervisor" });

        const supervisor_id = supervisors[0].id;
        const sql = `
            SELECT p.id AS proposal_id, p.title, p.file_path, p.status, p.submitted_at,
                   s.id AS student_id, CONCAT(u.first_name,' ', u.last_name) AS student_name, s.registration_no
            FROM proposals p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.supervisor_id = ?
            ORDER BY p.status ASC, p.submitted_at DESC`;

        const [rows] = await connection.query(sql, [supervisor_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. Approve / Reject proposal
exports.decideProposal = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { status, remarks } = req.body;
        const proposal_id = req.params.id;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be Approved or Rejected" });
        }

        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const supervisor_id = supervisors[0].id;

        // Check ownership and status
        const [rows] = await connection.query(
            `SELECT p.id FROM proposals p JOIN students s ON p.student_id = s.id 
             WHERE p.id = ? AND s.supervisor_id = ? AND p.status = 'Pending'`,
            [proposal_id, supervisor_id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Proposal not found or already decided" });

        await connection.beginTransaction();

        await connection.query(`UPDATE proposals SET status = ? WHERE id = ?`, [status, proposal_id]);

        const insertsql = `INSERT INTO approvals (reference_type, reference_id, approval_role, approved_by, status, remarks)
                           VALUES (?, ?, ?, ?, ?, ?)`;
        await connection.query(insertsql, ['proposal', proposal_id, 'Supervisor', req.user.id, status, remarks || null]);

        await connection.commit();
        res.json({ message: `Proposal ${status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- PROGRESS REPORTS ---

// 1. Get my student progress reports
exports.getStudentProgressReports = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const sql = `
            SELECT pr.id AS report_id, pr.semester, pr.file_path, pr.status, pr.submitted_at,
                   s.registration_no, CONCAT(u.first_name, ' ', u.last_name) AS student_name
            FROM progress_reports pr
            JOIN students s ON pr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.supervisor_id = ?
            ORDER BY pr.status ASC, pr.submitted_at DESC`;

        const [rows] = await connection.query(sql, [supervisors[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. Approve / Reject Progress Reports
exports.decideProgressReport = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { status, remarks } = req.body;
        const report_id = req.params.id;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be Approved or Rejected" });
        }

        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const [rows] = await connection.query(
            `SELECT pr.id FROM progress_reports pr JOIN students s ON pr.student_id = s.id 
             WHERE pr.id = ? AND s.supervisor_id = ? AND pr.status = 'Pending'`,
            [report_id, supervisors[0].id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Report not found or already decided" });

        await connection.beginTransaction();

        await connection.query(`UPDATE progress_reports SET status = ? WHERE id = ?`, [status, report_id]);

        const insertsql = `INSERT INTO approvals (reference_type, reference_id, approval_role, approved_by, status, remarks)
                           VALUES (?, ?, ?, ?, ?, ?)`;
        await connection.query(insertsql, ['report', report_id, 'Supervisor', req.user.id, status, remarks || null]);

        await connection.commit();
        res.json({ message: `Progress Report ${status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- PUBLICATIONS ---

exports.getMyStudentPublications = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const sql = `
            SELECT p.id AS publication_id, p.title, p.journal_name, p.year, p.type,
                   s.registration_no, CONCAT(u.first_name,' ',u.last_name) AS student_name
            FROM publications p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.supervisor_id = ?
            ORDER BY p.year DESC`;

        const [rows] = await connection.query(sql, [supervisors[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- THESIS ---

exports.getMyStudentThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const sql = `
            SELECT t.id AS thesis_id, t.title, t.file_path, t.status, t.submitted_at,
                   s.id AS student_id, s.registration_no, CONCAT(u.first_name,' ',u.last_name) AS student_name
            FROM thesis t
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.supervisor_id = ?
            ORDER BY t.status`;

        const [rows] = await connection.query(sql, [supervisors[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

exports.decideThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { status, remarks } = req.body;
        const thesis_id = req.params.id;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be Approved or Rejected" });
        }

        const [supervisors] = await connection.query(supsql, [req.user.id]);
        if (supervisors.length === 0) return res.status(403).json({ message: "Not a supervisor" });

        const [rows] = await connection.query(
            `SELECT t.id, t.version FROM thesis t JOIN students s ON t.student_id = s.id
             WHERE t.id = ? AND s.supervisor_id = ? AND t.status = 'Pending' AND t.is_locked = FALSE`,
            [thesis_id, supervisors[0].id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Thesis not found or already decided" });

        const version = rows[0].version;

        await connection.beginTransaction();

        await connection.query(`UPDATE thesis SET status = ? WHERE id = ?`, [status, thesis_id]);

        const insertsql = `INSERT INTO approvals (reference_type, reference_id, approval_role, approved_by, status, remarks, thesis_version)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(insertsql, ['thesis', thesis_id, 'Supervisor', req.user.id, status, remarks || null, version]);

        await connection.commit();
        res.json({ message: `Thesis ${status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};