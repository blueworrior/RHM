const db = require('../config/db');

// get supervisor id from user
const supsql = `SELECT id FROM supervisors WHERE user_id = ?`;

exports.getMyStudentProposals = (req, res) => {
    const user_id = req.user.id;
    
    // get supervisor id from user
    db.query(supsql, [user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error1" });
        
        if(result.length === 0)
            return res.status(409).json({ message: "Not a Supervisor" });

        const supervisor_id = result[0].id;

        const sql = `
            SELECT
                p.id AS proposal_id,
                p.title,
                p.file_path,
                p.status,
                p.submitted_at,
                s.id AS student_id,
                CONCAT(u.first_name,' ', u.last_name) AS student_name,
                s.registration_no
            FROM proposals p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE s.supervisor_id = ?
            ORDER BY p.status ASC
        `;
                
        db.query(sql, [supervisor_id], (err, rows) => {
            if(err) return res.status(500).json({ message: "Server Error2" });

            res.json(rows);
        });
    });
};

// 2. Approve / Reject proposal
exports.decideProposal = (req, res) => {
    const user_id = req.user.id;
    const proposals_id = req.params.id;
    const { status, remarks } = req.body;

    if(!status || !['Approved', 'Rejected'].includes(status))
        return res.status(400).json({ message:"Status must be Approved or Rejected" });

    // Get  supervisor id
    db.query(supsql,[user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error1" });

        if(result.length === 0)
            return res.status(403).json({ message: "Not a supervisor" });

        const supervisor_id = result[0].id;

        // check proposal belong to same supervisor and is pending
        const checksql = `
            SELECT p.id FROM proposals p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = ? AND s.supervisor_id = ? AND p.status = 'Pending'
        `;

        db.query(checksql, [proposals_id, supervisor_id], (err, rows) => {
            if(err) return res.status(500).json({ mssage: "Server Error2" });

            if(rows.length === 0)
                return res.status(403).json({ message: "Proposal not found or already decided" });

            // update proposal status
            const updatesql = `
                UPDATE proposals
                SET status = ?
                WHERE id = ?
            `;

            db.query(updatesql, [status, proposals_id], (err) => {
                if(err) return res.status(500).json({ message: "Server Error3" });
            
                // Insert into approvals
                const insertsql = `
                    INSERT INTO approvals
                    (reference_type, reference_id, approved_by, status, remarks)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(insertsql,
                    ['proposal', proposals_id, user_id, status, remarks || null], (err) => {
                        if(err){
                            // if error occur make the proposal status pending
                            const errorsql = `
                                UPDATE proposals
                                SET status = 'Pending'
                                WHERE id = ?
                            `;
                            db.query(errorsql, [proposals_id], (err) => {
                                return res.status(500).json({ message: "Server Error4" });
                            });
                            return;
                        }
                        res.json({ message: `Proposal ${status} successfully`});
                });            
            });
        });
    });
};