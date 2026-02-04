const db = require('../config/db');
const bcrypt = require('bcryptjs');

//check sql query
const checksql = 'SELECT id FROM users WHERE email = ?';

//insert user query
const usersql = `INSERT INTO users (role_id, first_name, last_name, email, password)
VALUES (?, ?, ?, ?, ?)`;

// get dept_id
const deptsql = `SELECT dept_id FROM coordinators WHERE user_id = ?`;

// STUDENTS
// -> 1. create Students
exports.createStudent = (req, res) => {
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
        return res.status(400).json({ message: "All feilds are required " });
    }

    //check email already exist
    db.query(checksql, [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length > 0) return res.status(409).json({ message: "Email already exists" });

        //check if student with same registration exist
        const regsql = 'SELECT id FROM students where registration_no = ?';

        db.query(regsql, [registration_no], async (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error1" });
            if (result.length > 0) return res.status(409).json({ message: "Registration number already exists" });

            try {
                //hashing pass
                const hashPass = await bcrypt.hash(password, 10);

                // create user
                db.query(usersql, [4, first_name, last_name, email, hashPass], (err, userResult) => {
                    if (err) return res.status(500).json({ message: "Server Error2" });

                    //getting user id
                    const user_id = userResult.insertId;

                    const studentsql = `INSERT INTO students
                (user_id, dept_id, registration_no, research_area, enrollment_date)
                VALUES (?, ?, ?, ?, ?)`;

                    db.query(studentsql, [user_id, dept_id, registration_no, research_area, enrollment_date], (err) => {
                        if (err) {
                            // ROLLBACK: delete created user
                            const deletesql = `DELETE FROM users WHERE id = ?`;

                            db.query(deletesql, [user_id], () => {
                                return res.status(500).json({ message: "Server Error3" });
                            });
                            return;
                        }

                        res.status(201).json({
                            message: "Student added",
                            user_id: user_id
                        });

                    });
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server Error" });
            }
        });
    });
};

// -> 2. Assign supervisor to students
exports.assignSupervisor = (req, res) => {
    const { student_id, supervisor_id } = req.body;

    if (!student_id || !supervisor_id) {
        return res.status(400).json({ message: "Student and Supervisor id are reqired" });
    }

    const stdsql = `SELECT id FROM students WHERE id = ?`;

    db.query(stdsql, [student_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) {
            return res.status(409).json({ message: "Student not found" });
        }

        const supsql = `SELECT id FROM supervisors WHERE id = ?`;

        db.query(supsql, [supervisor_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            if (result.length === 0) {
                return res.status(409).json({ message: "Supervisor not found" });
            }

            // Assign Supervisor
            const assignsql = `
                UPDATE students
                SET supervisor_id = ?
                WHERE id = ?
            `;

            db.query(assignsql, [supervisor_id, student_id], (err) => {
                if (err) return res.status(500).json({ message: "Server Error3" });

                res.json({ message: "Supervisor assign successfully" });
            });
        });
    });
};

// -> 3. List Supervisor of Coordinator Department
exports.getMyDepartmentSupervisors = (req, res) => {

    const user_id = req.user.id;

    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        const sql = `
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
        `;

        db.query(sql, [dept_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error1" });

            res.json(result);
        });
    });
};


// -> 4. List Students of Coordinator Department
exports.getMyDepartmentStudents = (req, res) => {

    const user_id = req.user.id;

    // find coordinator department
    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        const sql = `
            SELECT 
                students.id,
                students.registration_no,
                students.research_area,
                students.enrollment_date,

                users.first_name,
                users.last_name,
                users.email,

                CONCAT(supUsers.first_name, ' ', supUsers.last_name) AS supervisor

            FROM students
            JOIN users ON students.user_id = users.id

            LEFT JOIN supervisors ON students.supervisor_id = supervisors.id
            LEFT JOIN users AS supUsers ON supervisors.user_id = supUsers.id

            WHERE students.dept_id = ?
            ORDER BY users.first_name
        `;

        db.query(sql, [dept_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error1" });

            res.json(result);
        });
    });
};

// -> 5. List students without supervisor (my department)
exports.getUnassignedStudents = (req, res) => {

    const user_id = req.user.id;

    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) {
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const dept_id = result[0].dept_id;

        const sql = `
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
        `;

        db.query(sql, [dept_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            res.json(result);
        });
    });
};

// -> 6. Change / Remove supervisor from student
exports.removeSupervisor = (req, res) => {

    const { student_id } = req.body;

    if (!student_id) {
        return res.status(400).json({ message: "Student id required" });
    }

    const sql = `
        UPDATE students
        SET supervisor_id = NULL
        WHERE id = ?
    `;

    db.query(sql, [student_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Supervisor removed successfully" });
    });
};

// -> 7. Update student info
// Update student (only in coordinator's department)
exports.updateStudent = (req, res) => {

    const { student_id, research_area, registration_no } = req.body;
    const user_id = req.user.id;

    if (!student_id) {
        return res.status(400).json({ message: "Student id required" });
    }

    // find coordinator department
    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) {
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const dept_id = result[0].dept_id;

        // update only if student belongs to same department
        const sql = `
            UPDATE students
            SET 
                research_area = ?,
                registration_no = ?
            WHERE id = ?
              AND dept_id = ?
        `;

        db.query(sql, [research_area, registration_no, student_id, dept_id], (err, result) => {
            if (err) {
                return res.status(409).json({ message: "Registration number may already exist" });
            }

            if (result.affectedRows === 0) {
                return res.status(403).json({ message: "You cannot update this student" });
            }

            res.json({ message: "Student updated successfully" });
        });
    });
};


// -> 8. Delete student
// Delete student (delete both student + user safely)
exports.deleteStudent = (req, res) => {

    const { student_id } = req.params;
    const user_id = req.user.id;

    // 1. Find coordinator department
    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0) {
            return res.status(403).json({ message: "Not a coordinator" });
        }

        const dept_id = result[0].dept_id;

        // 2. Get student's user_id (only if in same department)
        const stdsql = `
            SELECT user_id 
            FROM students 
            WHERE id = ?
              AND dept_id = ?
        `;

        db.query(stdsql, [student_id, dept_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            if (result.length === 0) {
                return res.status(403).json({ message: "You cannot delete this student" });
            }

            const student_user_id = result[0].user_id;

            // 3. Delete USER (student will auto delete because of CASCADE)
            const deletesql = `DELETE FROM users WHERE id = ?`;

            db.query(deletesql, [student_user_id], (err) => {
                if (err) return res.status(500).json({ message: "Server Error3" });

                // deleted Successfully
                res.json({ message: "Student and user deleted successfully" });
            });
        });
    });
};

// 9. View department publications
exports.getDepartmentPublications = (req, res) => {

    const user_id = req.user.id;

    // get coordinator dept

    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0)
            return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        const sql = `
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
            where s.dept_id = ?
            ORDER BY p.year DESC
        `;

        db.query(sql, [dept_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            res.json(rows);
        });
    });
}

// 10. Assign examiner to thesis
exports.assignExaminer = (req, res) => {
    const user_id = req.user.id;
    const { thesis_id, examiner_id } = req.body;

    if (!thesis_id || !examiner_id) {
        return res.status(400).json({ message: "Thesis ID and Examiner ID are required" });
    }

    // find coordinator department
    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        // check thesis
        const thesisSql = `
            SELECT t.id
            FROM thesis t
            JOIN students s ON t.student_id = s.id
            WHERE t.id = ?
              AND s.dept_id = ?
              AND t.status IN ('Approved', 'Under_Examination')
              AND t.is_locked = FALSE
        `;

        db.query(thesisSql, [thesis_id, dept_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            if (rows.length === 0)
                return res.status(409).json({
                    message: "Thesis not approved or not in your department"
                });

            // check examiner
            const examinerSql = `
                SELECT id FROM examiners
                WHERE id = ? AND dept_id = ?
            `;

            db.query(examinerSql, [examiner_id, dept_id], (err, rows) => {
                if (err) return res.status(500).json({ message: "Server Error3" });
                if (rows.length === 0)
                    return res.status(409).json({
                        message: "Examiner not in your department"
                    });

                // prevent duplicate
                const checkSql = `
                    SELECT COUNT(*) AS total FROM examiner_assignments
                    WHERE thesis_id = ?
                `;

                db.query(checkSql, [thesis_id], (err, rows) => {
                    if (err) return res.status(500).json({ message: "Server Error4" });
                    if (rows[0].total >= 3)
                        return res.status(409).json({
                            message: "Maximum 3 Examiner allowed"
                        });

                    // assign examiner
                    const insertSql = `
                        INSERT INTO examiner_assignments (thesis_id, examiner_id)
                        VALUES (?, ?)
                    `;


                    db.query(insertSql, [thesis_id, examiner_id], (err) => {
                        if (err) return res.status(500).json({ message: "Server Error5" });

                        // update thesis status
                        const statussql = `
                            UPDATE thesis
                            SET status = 'Under_Examination'
                            WHERE id = ? AND status != 'Under_Examination'
                        `;

                        db.query(statussql, [thesis_id], (err) => {
                            if (err) {
                                // rollback assignment
                                db.query(
                                    `DELETE FROM examiner_assignments 
                                        WHERE thesis_id = ?
                                        AND examiner_id = ?`,
                                    [thesis_id, examiner_id]
                                );
                                return res.status(500).json({ message: "Server Error6" });
                            }

                            res.json({ message: "Examiner assigned successfully" });
                        });
                    });
                });
            });
        });
    });
};

// 11. Get examiner evaluations for a thesis
exports.getEvaluatedTheses = (req, res) => {

    const user_id = req.user.id;

    // get coordinator department
    db.query(deptsql, [user_id], (err, result) => {

        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length === 0)
            return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        const sql = `
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
        `;

        db.query(sql, [dept_id], (err, rows) => {

            if (err)
                return res.status(500).json({ message: "Server Error2" });

            res.json({
                total: rows.length,
                theses: rows
            });
        });
    });
};


// 12. Get thesis with evaluations
exports.getThesisEvaluations = (req, res) => {
    const user_id = req.user.id;
    const thesis_id = req.params.id;

    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        const evalSql = `
            SELECT
            eg.thesis_id,
                t.version AS current_version,
                eg.grade,
                eg.remarks,
                eg.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS examiner_name
            FROM examiner_grades eg
            JOIN thesis t ON eg.thesis_id = t.id
            JOIN students s ON t.student_id = s.id
            JOIN examiners e ON eg.examiner_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE s.dept_id = ?
            AND eg.thesis_version = t.version
            AND eg.thesis_id = ?
            ORDER BY eg.created_at DESC
            `;

        db.query(evalSql, [dept_id, thesis_id], (err, evals) => {
            if (err) return res.status(500).json({ message: "Server Error3" });

            res.json({
                total: evals.length,
                evaluations: evals
            });
        });
    });
};



// 13. get ready thesis
exports.getReadyThesis = (req,res)=>{

    const user_id = req.user.id;

    db.query(deptsql,[user_id],(err,result)=>{

        if(err) return res.status(500).json({message:"Server Error"});
        if(result.length===0)
            return res.status(403).json({message:"Not coordinator"});

        const dept_id = result[0].dept_id;
        
        const sql = `
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
        `;

        db.query(sql,[dept_id],(err,rows)=>{
            if(err) return res.status(500).json({message:"Server Error2"});

            res.json(rows);
        });
    });
};


// 14. Finalize Thesis
exports.finalizeThesis = (req, res) => {
    const user_id = req.user.id;
    const thesis_id = req.params.id;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status))
        return res.status(400).json({ message: "Invalid final status" });

    // get coordinator dept
    db.query(deptsql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        if (result.length === 0)
            return res.status(403).json({ message: "Not a coordinator" });

        const dept_id = result[0].dept_id;

        // check thesis
        const thesisSql = `
            SELECT t.id, t.version, t.status
            FROM thesis t
            JOIN students s ON t.student_id = s.id
            WHERE
                t.id = ?
                AND s.dept_id = ?
                AND t.ready_for_final = TRUE
                
        `;

        db.query(thesisSql, [thesis_id, dept_id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Server Error2" });
            
            // if(rows.status === 'Approved_Final'){
            //     return res.status(403).json({ message: "Thesis is already finally approved and locked" });
            // }
            
            
            if (rows.length === 0)
                return res.status(403).json({ message: "Invalid thesis state" });
            
            if(rows[0].status === 'Approved_Final')
                return res.status(403).json({ message: "Thesis already finalized and locked" });

            if(rows[0].status === 'Rejected')
                return res.status(403).json({ message: "Thesis already rejected" });

            const version = rows[0].version;
            
            // check examiner evaluations
            const evalSql = `
                SELECT COUNT(DISTINCT examiner_id) AS total
                FROM examiner_grades
                WHERE thesis_id = ? AND thesis_version = ?
            `;

            db.query(evalSql, [thesis_id, version], (err, rows) => {
                if (err) return res.status(500).json({ message: "Server Error3" });

                if (rows[0].total === 0)
                    return res.status(409).json({ message: "No examiner evaluation yet" });
                
                if (rows[0].total < 2)
                    return res.status(409).json({ message: "Atleast 2 examiner evaluations required" });

                const updatesql = `UPDATE thesis SET status = ?, is_locked = ? WHERE id = ?`;
                // update thesis
                db.query(
                    updatesql,
                    [status==='Approved'?'Approved_Final':status,
                    status==='Approved',
                    thesis_id],
                    (err) => {
                    if (err) return res.status(500).json({ message: "Server Error4" });
                    
                    // approval record
                    const insertsql = `
                    INSERT INTO approvals
                    (reference_type, reference_id, approval_role, approved_by, status, remarks, thesis_version)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    
                    db.query(insertsql,
                        ['thesis', thesis_id, 'Coordinator', user_id, status, remarks || null, version],
                        (err) => {
                            if (err) {
                                                    
                                //rollback
                                db.query("UPDATE thesis SET status = ? WHERE id = ?", ['Pending',thesis_id], () => {
                                    res.status(500).json({ message: "Server Error5", error: err });
                                });
                                return;
                            }

                            // deleting examiner assigment
                            const deleteSql = `
                                UPDATE examiner_assignments
                                    SET is_active = FALSE
                                    WHERE thesis_id = ?
                            `;

                            db.query(deleteSql, [thesis_id]);

                            // status updated successfully
                            res.json({ message: `Thesis ${status} successfully` });
                            
                        }
                    );
                    }
                );
            });
        });
    });
};