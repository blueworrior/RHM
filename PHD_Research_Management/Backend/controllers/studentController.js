const db = require('../config/db');
const { deleteFile } = require('../middleware/fileDelete');
// const deleteFile = requier('../middleware/fileDelete.js')

// helper query for student id
const stdsql = 'SELECT id FROM students WHERE user_id = ?';

// --- PROPOSALS ---

// 1. Submit Proposals
exports.submitProposal = async (req, res) => {
    const connection = await db.promise().getConnection();

    // eep trac of file path to clean up
    const filePathToDelete = req.file ? 'uploads/proposals/' + req.file.filename : null;
    try {
        const user_id = req.user.id;
        const { title } = req.body;

        if (!req.file) return res.status(400).json({ message: "Proposal file is required" });
        if (!title) {
            deleteFile(filePathToDelete); // Delete if title is missing
            return res.status(409).json({ message: "Title is required" });

        } 

        const file_path = 'uploads/proposals/' + req.file.filename;

        // Get student id
        const [students] = await connection.query(stdsql, [user_id]);
        if (students.length === 0) {
            deleteFile(filePathToDelete); // Delete if not a student
            return res.status(409).json({ message: "Not a Student" });
        }
        const student_id = students[0].id;

        // Check for existing pending proposal
        const checkppsql = `SELECT id FROM proposals WHERE student_id = ? AND status = 'pending'`;
        const [pending] = await connection.query(checkppsql, [student_id]);

        if (pending.length > 0) {
            deleteFile(filePathToDelete); // Delete if they already have a pending one
            return res.status(409).json({ message: "You already have a pending proposal. Wait for decision first." });
        }

        // Insert new proposal
        const insertsql = `INSERT INTO proposals (student_id, title, file_path) VALUES(?, ?, ?)`;
        const [result] = await connection.query(insertsql, [student_id, title, file_path]);

        res.status(201).json({
            message: "Proposal Submitted Successfully",
            proposal_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        deleteFile(filePathToDelete); // IMPORTANT: Delete if DB crashes
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. List Proposals
exports.getMyProposals = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(409).json({ message: "Not a Student" });

        const sql = `
            SELECT id, title, status, submitted_at 
            FROM proposals 
            WHERE student_id = ? 
            ORDER BY submitted_at DESC`;
        const [rows] = await connection.query(sql, [students[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 3. View Proposal Status (with Latest Approval)
exports.getMyProposalStatus = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(403).json({ message: "Not a student" });

        const sql = `
            SELECT p.id AS proposal_id, p.title, p.status, p.submitted_at,
                   a.status AS decision_status, a.remarks, a.approved_at
            FROM proposals p
            LEFT JOIN approvals a ON a.reference_type = 'proposal' AND a.reference_id = p.id
            AND a.id = (SELECT MAX(id) FROM approvals WHERE reference_type = 'proposal' AND reference_id = p.id)
            WHERE p.student_id = ?
            ORDER BY p.submitted_at DESC`;

        const [rows] = await connection.query(sql, [students[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- PROGRESS REPORT ---

// 1. Submit Progress Report
exports.submitProgressReport = async (req, res) => {
    const connection = await db.promise().getConnection();
    const filePathToDelete = req.file ? 'uploads/progress_reports/' + req.file.filename : null;

    try {
        const { semester } = req.body;
        if (!req.file) return res.status(400).json({ message: "Progress report file is required" });
        if (!semester) {
            deleteFile(filePathToDelete);
            return res.status(400).json({ message: "Semester is Missing" });
        } 

        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) {
            deleteFile(filePathToDelete);
            return res.status(403).json({ message: "Not a Student" });
        }
        
        const student_id = students[0].id;
        const file_path = 'uploads/progress_reports/' + req.file.filename;

        // Check if already submitted and not rejected
        const checksql = `SELECT id FROM progress_reports WHERE student_id = ? AND semester = ? AND status != 'Rejected'`;
        const [existing] = await connection.query(checksql, [student_id, semester]);

        if (existing.length > 0) {
            deleteFile(filePathToDelete);
            return res.status(409).json({ message: "Report for this semester already exists. Wait for decision." });
        }

        const insertsql = `INSERT INTO progress_reports (student_id, semester, file_path) VALUES (?, ?, ?)`;
        const [result] = await connection.query(insertsql, [student_id, semester, file_path]);

        res.status(201).json({ message: "Progress Report Submitted Successfully", report_id: result.insertId });
    } catch (err) {
        console.error(err);
        deleteFile(filePathToDelete);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. List Progress Reports
exports.getMyProgressReport = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(403).json({ message: "Not a Student" });

        const sql = `SELECT id, semester, status, submitted_at FROM progress_reports WHERE student_id = ? ORDER BY submitted_at DESC`;
        const [rows] = await connection.query(sql, [students[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- PUBLICATIONS ---

// 1. Add Publication
exports.addPublication = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { title, journal_name, year, type } = req.body;
        if (!title || !year || !type) return res.status(400).json({ message: "Title, year and type are required" });
        if (!['Journal', 'Conference'].includes(type)) return res.status(400).json({ message: "Type must be Conference or Journal" });

        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(403).json({ message: "Not a student" });

        const insertsql = `INSERT INTO publications (student_id, title, journal_name, year, type) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await connection.query(insertsql, [students[0].id, title, journal_name || null, year, type]);

        res.status(201).json({ message: "Publication added successfully", publication_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. List My Publications
exports.getMypublication = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(403).json({ message: "Not a student" });

        const sql = `SELECT id, title, journal_name, year, type FROM publications WHERE student_id = ? ORDER BY year DESC`;
        const [rows] = await connection.query(sql, [students[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// --- THESIS ---

// 1. Submit Thesis
exports.submitThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    const filePathToDelete = req.file ? 'uploads/thesis/' + req.file.filename : null;

    try {
        const { title } = req.body;
        if (!title || !req.file) {
            deleteFile(filePathToDelete);
            return res.status(400).json({ message: "Title and File are required" });
        }

        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0){
            deleteFile(filePathToDelete);
            return res.status(403).json({ message: "Not a student" });
        }

        const student_id = students[0].id;
        const [existing] = await connection.query(`SELECT id FROM thesis WHERE student_id = ?`, [student_id]);
        if (existing.length > 0){
            deleteFile(filePathToDelete);
            return res.status(409).json({ message: "Thesis already submitted" });
        }

        const file_path = 'uploads/thesis/' + req.file.filename;
        const insertsql = `INSERT INTO thesis (student_id, title, file_path) VALUES (?, ?, ?)`;
        const [result] = await connection.query(insertsql, [student_id, title, file_path]);

        res.status(201).json({ message: "Thesis submitted successfully", thesis_id: result.insertId });
    } catch (err) {
        console.error(err);
        deleteFile(filePathToDelete);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 2. List Thesis
exports.getMyThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) return res.status(403).json({ message: "Not a student" });

        const sql = `
            SELECT t.id, t.title, t.file_path, t.status, t.version,
                   a.status AS decision_status, a.remarks, a.approval_role, a.approved_at
            FROM thesis t
            LEFT JOIN approvals a ON a.id = (
                SELECT id FROM approvals WHERE reference_type = 'thesis' AND reference_id = t.id 
                AND thesis_version = t.version ORDER BY id DESC LIMIT 1
            )
            WHERE t.student_id = ?`;

        const [rows] = await connection.query(sql, [students[0].id]);
        res.json(rows.length ? rows[0] : null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};

// 3. Resubmit Thesis
exports.resubmitThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    const filePathToDelete = req.file ? 'uploads/thesis/' + req.file.filename : null;

    try {
        if (!req.file) return res.status(400).json({ message: "Thesis file is required" });

        const [students] = await connection.query(stdsql, [req.user.id]);
        if (students.length === 0) {
            deleteFile(filePathToDelete);
            return res.status(403).json({ message: "Not a student" });
        }

        const student_id = students[0].id;
        const [rows] = await connection.query(`SELECT id, status, version, is_locked FROM thesis WHERE student_id = ?`, [student_id]);

        if (rows.length === 0) {
            deleteFile(filePathToDelete);
            return res.status(404).json({ message: "Thesis not found" });
        } 
        const thesis = rows[0];

        if (thesis.status !== 'Rejected' || thesis.is_locked) {
            deleteFile(filePathToDelete);
            return res.status(403).json({ message: "Thesis is locked or not in rejected state." });
        }

        const file_path = 'uploads/thesis/' + req.file.filename;
        const newVersion = thesis.version + 1;

        await connection.query(
            `UPDATE thesis SET file_path = ?, version = ?, status = 'Pending', ready_for_final = FALSE WHERE id = ?`,
            [file_path, newVersion, thesis.id]
        );

        await connection.query(`DELETE FROM examiner_assignments WHERE thesis_id = ?`, [thesis.id]);

        res.json({ message: "Thesis Resubmitted successfully", new_version: newVersion });
    } catch (err) {
        console.error(err);
        deleteFile(filePathToDelete);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};