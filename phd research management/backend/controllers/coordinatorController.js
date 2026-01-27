const db = require('../config/db');
const bcrypt = require('bcryptjs');

//check sql query
const checksql = 'SELECT id FROM users WHERE email = ?';

//insert user query
const usersql = `INSERT INTO users (role_id, first_name, last_name, email, password)
VALUES (?, ?, ?, ?, ?)`;

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
        
        db.query(regsql,[registration_no], async (err, result) => {
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
    
    const deptsql = `SELECT dept_id from coordinators where user_id = ?`;

    db.query(deptsql, [user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error1" });
        
        if(result.length === 0) return res.status(403).json({ message: "Not a coordinator" });
        
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
            if(err) return res.status(500).json({ message: "Server Error1" });
            
            res.json(result);
        });
    });
};


// -> 4. List Students of Coordinator Department
exports.getMyDepartmentStudents = (req, res) => {
    
    const user_id = req.user.id;

    const deptsql = `SELECT dept_id from coordinators where user_id = ?`;

    db.query(deptsql, [user_id], (err, result) => {
        if(err) return res.status(500).json({ message: "Server Error1" });
        
        if(result.length === 0) return res.status(403).json({ message: "Not a coordinator" });
    
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
            if(err) return res.status(500).json({ message: "Server Error1" });

            res.json(result);
        });
    });
};

// -> 5. List students without supervisor (my department)
exports.getUnassignedStudents = (req, res) => {

    const user_id = req.user.id;

    const deptsql = `SELECT dept_id FROM coordinators WHERE user_id = ?`;

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
    const deptsql = `SELECT dept_id FROM coordinators WHERE user_id = ?`;

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
    const deptsql = `SELECT dept_id FROM coordinators WHERE user_id = ?`;

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

// -> View department publications
exports.getDepartmentPublications = (req, res) => {

    const user_id = req.user.id;

    // get coordinator dept
    const deptsql = `SELECT dept_id FROM coordinators WHERE user_id = ?`;

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