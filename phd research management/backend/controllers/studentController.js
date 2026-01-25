const db = require('../config/db');

const stdsql = 'SELECT id FROM students where user_id = ?';

// 1. Submit Proposals
exports.submitProposal = (req, res) => {
    const user_id = req.user.id;
    const { title } = req.body;

    if(!req.file) return res.status(400).json({ message: "Proposal file is required" });

    const file_path = 'uploads/proposals/' + req.file.filename;

    if(!title) {
        return res.status(409).json("title is required");
    }

    //get student id from users
    db.query(stdsql, [user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error" });
        
        if(result.length === 0) return res.status(409).json({ message: "Not a Student" });
        
        const student_id = result[0].id;
        
        const checkppsql = `SELECT id FROM proposals
        WHERE student_id = ? AND status = 'pending'
        `;
        
        db.query(checkppsql, [student_id], (err, result) => {
            if(err) return res.status(500).json({ message: "Server Error2" });
            
            if(result.length > 0) {
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
                if(err) return res.status(500).json({ message: "Server Error3", error: err });

                res.status(201).json({ 
                    message: "Proposal Submit Successfully",
                    proposal_id: result.insertId
                });
            });
        });
    });
};

// 2. List Proposals
exports.getMyProposals = (req, res) => {
    const user_id = req.user.id;
    
    db.query(stdsql, [user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error" });
        
        if(result.length === 0) return res.status(409).json({ message: "Not a Student" });

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

        db.query(checksql,[student_id], (err, result) => {
            if(err) return res.status(500).json({ message: "Server Error" });

            res.json(result);
        });
    });
};