const db = require('../config/db');

const stdsql = 'SELECT id FROM students where user_id = ?';

// PROPOSALS
// -> 1. Submit Proposals
exports.submitProposal = (req, res) => {
    const user_id = req.user.id;
    const { title } = req.body;

    if (!req.file) return res.status(400).json({ message: "Proposal file is required" });

    const file_path = 'uploads/proposals/' + req.file.filename;

    if (!title) {
        return res.status(409).json("Title is required");
    }

    //get student id from users
    db.query(stdsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error" });

        if (result.length === 0) return res.status(409).json({ message: "Not a Student" });

        const student_id = result[0].id;

        const checkppsql = `SELECT id FROM proposals
        WHERE student_id = ? AND status = 'pending'
        `;

        db.query(checkppsql, [student_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            if (result.length > 0) {
                return res.status(409).json({
                    message: "You already have a pending proposals. Wait for decision first"
                });
            }

            //Insert new proposal
            const insertsql = `
                INSERT INTO proposals (student_id, title, file_path)
                VALUES(?, ?, ?)
                `;

            db.query(insertsql, [student_id, title, file_path], (err, result) => {
                if (err) return res.status(500).json({ message: "Server Error3" });

                res.status(201).json({
                    message: "Proposal Submit Successfully",
                    proposal_id: result.insertId
                });
            });
        });
    });
};

// -> 2. List Proposals
exports.getMyProposals = (req, res) => {
    const user_id = req.user.id;

    db.query(stdsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) return res.status(409).json({ message: "Not a Student" });

        const student_id = result[0].id;

        const checksql = `
            SELECT
                id,
                title,
                status,
                submitted_at
            FROM proposals
            WHERE student_id = ?
            ORDER BY submitted_at DESC
        `;

        db.query(checksql, [student_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            res.json(result);
        });
    });
};

// -> 3. View proposals
exports.getMyProposalStatus = (req, res) => {
    const user_id = req.user.id;

    // get student id
    db.query(stdsql, [user_id], (err, result) => {
        if (err) return res.status(400).json({ message: "Server Error1" });

        if (result.length === 0)
            return res.status(403).json({ message: "Not a student" });

        const student_id = result[0].id;

        const sql = `
            SELECT
                p.id AS proposal_id,
                p.title,
                p.status,
                p.submitted_at,
                a.status AS decision_status,
                a.remarks,
                a.approved_at
            FROM proposals p
            LEFT JOIN approvals a 
                ON a.reference_type = 'proposal'
                AND a.reference_id = p.id
                AND a.id = (
                    SELECT MAX(id)
                    FROM approvals
                    WHERE reference_type = 'proposal'
                    AND reference_id = p.id
                )
            WHERE p.student_id = ?
            ORDER BY p.submitted_at DESC
        `;

        db.query(sql, [student_id], (err, rows) => {
            if (err) return res.status(400).json({ message: "Server Error2" });

            res.json(rows);
        });
    });
};

// PROGRESS REPORT
// -> 1.submit progress report
exports.submitProgressReport = (req, res) => {
    const user_id = req.user.id;
    const { semester } = req.body;

    if (!semester) return res.status(400).json({ message: "Semester is Missing" });

    if (!req.file)
        return res.status(400).json({ message: "Progress report file is required" });

    const file_path = 'uploads/progress_reports/' + req.file.filename;

    // get student id
    db.query(stdsql, [user_id], (err, result) => {
        if (err)
            return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0)
            return res.status(403).json({ message: "Not a Student" });

        const student_id = result[0].id;

        // Check if already submitted for this semester and not rejected
        const checksql = `
            SELECT id FROM progress_reports
            WHERE student_id = ? 
            AND semester = ?
            AND status != 'Rejected'
        `;

        db.query(checksql, [student_id, semester], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error" });

            if (rows.length > 0) {
                return res.status(409).json({
                    message: "You already have a progress report for this semester. Wait for decision or correction."
                });
            }

            //Insert Report
            const insertsql = `
            INSERT INTO progress_reports (student_id, semester, file_path)
            VALUES (?, ?, ?)
        `;

            db.query(insertsql, [student_id, semester, file_path], (err, result) => {
                if (err) return res.status(500).json({ message: "Server Error2" });

                res.status(201).json({
                    message: "Progress Report Submitted Successfully",
                    report_id: result.insertId
                });
            });
        });
    });
};

// -> 2. List My Proposals Reports
exports.getMyProgressReport = (req, res) => {
    const user_id = req.user.id;

    // get student id
    db.query(stdsql, [user_id], (err, result) => {

        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.lenght === 0)
            return res.status(403).json({ message: "Not a Student" });

        const student_id = result[0].id;

        const sql = `
            SELECT
                id,
                semester,
                status,
                submitted_at
            FROM progress_reports
            WHERE student_id = ?
            ORDER BY submitted_at DESC
        `;

        db.query(sql, [student_id], (err, rows) => {
            if (err)
                return res.status(500).json({ message: "Server Error2" });

            res.json(rows);
        });
    });
};

// PUBLICATIONS
// -> 1. Add Publication
exports.addPublication = (req, res) => {

    const user_id = req.user.id;
    const { title, journal_name, year, type } = req.body;

    if(!title || !year || !type)
        return res.status(400).json({ message: "Title, year and type are required" });

    if(!['Journal','Conference'].includes(type))
        return res.status(400).json({ message: "Type must be Conference or Journal" });

    // get student id
    db.query(stdsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if(result.length === 0)
            return res.status(500).json({ message: "Server Error2" });
    
        const student_id = result[0].id;

        const insertsql = `
            INSERT INTO publications (student_id, title, journal_name, year, type)
            VALUE (?, ?, ?, ?, ?)
        `;

        db.query(insertsql, [student_id, title, journal_name || null, year, type], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error3" });

            res.status(201).json({
                message: "Publication added successfully",
                publication_id: result.insertId
            });
        });
    });
};

// -> 2. List My publication
exports.getMypublication = (req, res) => {
    const user_id = req.user.id;

    // get student id
    db.query(stdsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0)
            return res.status(403).json({ message: "Not a student" });

        const student_id = result[0].id;

        const sql = `
            SELECT
                id,
                title,
                journal_name,
                year,
                type
            FROM publications
            WHERE student_id = ?
            ORDER BY year DESC 
        `;

        db.query(sql, [student_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            res.json(rows);
        });
    });
};