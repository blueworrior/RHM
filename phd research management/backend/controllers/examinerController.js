const db = require('../config/db');

// get examiner id
const examinersql = `SELECT id FROM examiners WHERE user_id = ?`;

// 1. List assigned theses
exports.getMyAssignedTheses = (req, res) => {
    const user_id = req.user.id;

    // get examiner id
    db.query(examinersql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not an examiner" });

        const examiner_id = result[0].id;

        const sql = `
            SELECT
                t.id AS thesis_id,
                t.title,
                t.file_path,
                t.status,
                t.submitted_at,
                s.registration_no,
                CONCAT(u.first_name, ' ', u.last_name) AS student_name
            FROM examiner_assignments ea
            JOIN thesis t ON ea.thesis_id = t.id
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE ea.examiner_id = ?
            ORDER BY t.status
        `;

        db.query(sql, [examiner_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            res.json(rows);
        });
    });
};


// 2. Evaluate Thesis (VERSION SAFE)
exports.evaluateThesis = (req, res) => {
    const user_id = req.user.id;
    const { grade, remarks } = req.body;
    const thesis_id = req.params.id;

    if (!thesis_id || !grade)
        return res.status(400).json({ message: "Missing fields" });

    // get examiner id
    db.query(examinersql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not an examiner" });

        const examiner_id = result[0].id;

        // get thesis version & verify assignment
        const thesisSql = `
            SELECT t.version
            FROM examiner_assignments ea
            JOIN thesis t ON ea.thesis_id = t.id
            WHERE ea.examiner_id = ?
                AND t.id = ?
                AND t.status = 'Under_Examination'
                AND t.is_locked = FALSE
        `;

        db.query(thesisSql, [examiner_id, thesis_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            if (rows.length === 0)
                return res.status(403).json({ message: "Not authorized" });

            const version = rows[0].version;

            // prevent duplicate evaluation PER VERSION
            const checkSql = `
                SELECT id FROM examiner_grades
                WHERE thesis_id = ?
                  AND examiner_id = ?
                  AND thesis_version = ?
            `;

            db.query(checkSql, [thesis_id, examiner_id, version], (err, rows) => {
                if (err) return res.status(500).json({ message: "Server Error3" });
                if (rows.length > 0)
                    return res.status(409).json({ message: "Already evaluated for this version" });

                // insert grade
                const insertSql = `
                    INSERT INTO examiner_grades
                    (thesis_id, examiner_id, thesis_version, grade, remarks)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(insertSql, [thesis_id, examiner_id, version, grade, remarks], (err) => {
                    if (err) return res.status(500).json({ message: "Server Error4" });

                    // 🔥 CHECK if 2 examiners finished evaluation
                    const readySql = `
                        SELECT COUNT(DISTINCT examiner_id) as total
                        FROM examiner_grades
                        WHERE thesis_id = ?
                        AND thesis_version = ?
                    `;
                    db.query(readySql, [thesis_id, version], (err, rows) => {
                        if (err) return res.status(500).json({ message: "Server Error after grading" });

                        if (rows[0].total >= 2) {

                            const updateReady = `
                                UPDATE thesis
                                SET ready_for_final = TRUE
                                WHERE id = ?
                            `;

                            db.query(updateReady, [thesis_id]);
                        }

                        res.json({ message: "Evaluation submitted successfully" });
                    });
                });
            });
        });
    });
};

