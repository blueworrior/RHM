const db = require('../config/db');

// SQL to get examiner id
const examinersql = `SELECT id FROM examiners WHERE user_id = ?`;

// 1. List assigned theses
exports.getMyAssignedTheses = async (req, res) => {
    try {
        const user_id = req.user.id;

        // get examiner id
        const [examinerResult] = await db.promise().query(examinersql, [user_id]);
        
        if (examinerResult.length === 0) {
            return res.status(403).json({ message: "Not an examiner" });
        }

        const examiner_id = examinerResult[0].id;

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

        const [rows] = await db.promise().query(sql, [examiner_id]);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error fetching assigned theses" });
    }
};


// 2. Evaluate Thesis (VERSION SAFE & TRANSACTIONAL)
exports.evaluateThesis = async (req, res) => {
    const connection = await db.promise().getConnection();
    
    try {
        const user_id = req.user.id;
        const { grade, remarks } = req.body;
        const thesis_id = req.params.id;

        if (!thesis_id || !grade) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // 1. Get examiner id
        const [examinerResult] = await connection.query(examinersql, [user_id]);
        if (examinerResult.length === 0) {
            return res.status(403).json({ message: "Not an examiner" });
        }
        const examiner_id = examinerResult[0].id;

        // 2. Verify assignment and get current thesis version
        const thesisSql = `
            SELECT t.version
            FROM examiner_assignments ea
            JOIN thesis t ON ea.thesis_id = t.id
            WHERE ea.examiner_id = ?
                AND t.id = ?
                AND t.status = 'Under_Examination'
                AND t.is_locked = FALSE
        `;
        const [thesisRows] = await connection.query(thesisSql, [examiner_id, thesis_id]);
        
        if (thesisRows.length === 0) {
            return res.status(403).json({ message: "Not authorized or thesis not ready for evaluation" });
        }
        const version = thesisRows[0].version;

        // START TRANSACTION [cite: 313]
        await connection.beginTransaction();

        // 3. Prevent duplicate evaluation PER VERSION
        const checkSql = `
            SELECT id FROM examiner_grades
            WHERE thesis_id = ?
              AND examiner_id = ?
              AND thesis_version = ?
        `;
        const [existingGrades] = await connection.query(checkSql, [thesis_id, examiner_id, version]);
        
        if (existingGrades.length > 0) {
            await connection.rollback(); 
            return res.status(409).json({ message: "Already evaluated for this version" });
        }

        // 4. Insert grade [cite: 317]
        const insertSql = `
            INSERT INTO examiner_grades
            (thesis_id, examiner_id, thesis_version, grade, remarks)
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.query(insertSql, [thesis_id, examiner_id, version, grade, remarks]);

        // 5. CHECK if 2 examiners finished evaluation for this specific version
        const readySql = `
            SELECT COUNT(DISTINCT examiner_id) as total
            FROM examiner_grades
            WHERE thesis_id = ?
            AND thesis_version = ?
        `;
        const [countRows] = await connection.query(readySql, [thesis_id, version]);

        if (countRows[0].total >= 2) {
            const updateReady = `
                UPDATE thesis
                SET ready_for_final = TRUE
                WHERE id = ?
            `;
            await connection.query(updateReady, [thesis_id]);
        }

        await connection.commit();
        res.json({ message: "Evaluation submitted successfully" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Server Error during evaluation" });
    } finally {
        connection.release();
    }
};