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
        `;

        db.query(sql, [examiner_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            res.json(rows);
        });
    });
};

// 2. Decide thesis
exports.decideThesis = (req, res) => {
    const user_id = req.user.id;
    const thesis_id = req.params.id;
    const { status, remarks } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status))
        return res.status(400).json({ message: "Invalid status" });

    // get examiner id
    db.query(examinersql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not an examiner" });

        const examiner_id = result[0].id;

        // check assignment
        const checksql = `
            SELECT ea.id FROM examiner_assignments ea
            JOIN thesis t ON ea.thesis_id = t.id
            WHERE ea.examiner_id = ? AND t.id = ? AND t.status = 'Under_Examination'
        `;

        db.query(checksql, [examiner_id, thesis_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            if (rows.length === 0)
                return res.status(403).json({ message: "Thesis not found or already decided" });

            // update thesis
            const updatesql = `
                UPDATE thesis
                SET status = ?
                WHERE id = ?
            `;

            db.query(updatesql, [status, thesis_id], (err) => {
                if (err) return res.status(500).json({ message: "Server Error3" });

                // insert approval
                const insertsql = `
                    INSERT INTO approvals
                    (reference_type, reference_id, approved_by, status, remarks)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    insertsql,
                    ['thesis', thesis_id, user_id, status, remarks+'(Examiner)' || null],
                    (err) => {
                        if (err) {
                            // rollback
                            db.query(
                                `UPDATE thesis SET status = 'Pending' WHERE id = ?`,
                                [thesis_id]
                            );
                            return res.status(500).json({ message: "Server Error4" });
                        }

                        res.json({ message: `Thesis ${status} successfully` });
                    }
                );
            });
        });
    });
};
