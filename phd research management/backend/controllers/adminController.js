const db = require('../config/db');
const bcrypt = require('bcryptjs')

const usersql = `INSERT INTO users (role_id, first_name, last_name, email, password)
VALUES (?, ?, ?, ?, ?)`;

const checksql = 'SELECT id FROM users WHERE email = ?';

// 1. DEPARTMENT
//  -> Create Department
exports.createDepartment = (req, res) => {
    const { name } = req.body;

    // error message
    if (!name) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    //check if same department exist
    const depchecksql = 'SELECT id FROM departments WHERE name = ?';
    db.query(depchecksql, [name], (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (result.length > 0) {
            return res.status(409).json({ message: "Department with same name exists" });
        }

        // create new departname with name
        const sql = 'INSERT INTO departments (name) VALUES (?)';

        db.query(sql, [name], (err, result) => {
            if (err) return res.status(500).json({ message: "Server Error2" });

            res.status(201).json({
                message: "Department Created Successfully",
                department_id: result.insertId
            });
        });
    });
};

//  -> List Department
exports.getDepartments = (req, res) => {
    const sql = `SELECT id, name FROM departments ORDER BY name`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        res.json(result);
    });
};


// 2. COORDINATOR
//  -> Create Coordinator
exports.createCoordinator = (req, res) => {
    const { first_name, last_name, email, password, dept_id } = req.body;

    if (!first_name || !last_name || !email || !password || !dept_id) {
        return res.status(400).json({ message: "All feilds are required" });
    }

    // check if email exist
    const checksql = 'SELECT id FROM users WHERE email = ?';

    db.query(checksql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (results.length > 0) {
            return res.status(409).json({ message: "Email already exist" });
        }

        try {
            // hash passowrd
            const hashPass = await bcrypt.hash(password, 10);

            // insert into user
            db.query(usersql, [2, first_name, last_name, email, hashPass], (err, userResult) => {
                if (err) return res.status(500).json({ message: "Server Error2" });

                const user_id = userResult.insertId;

                // Insert into coordinator role
                const coorsql = `INSERT INTO coordinators (user_id, dept_id)
                VALUES (?, ?)`;

                db.query(coorsql, [user_id, dept_id], (err) => {
                    if (err) {
                        // ROLLBACK: delete created user
                        const deletesql = `DELETE FROM users WHERE id = ?`;

                        db.query(deletesql, [user_id], () => {
                            return res.status(500).json({ message: "Server Error3" });
                        });

                        return;
                    }

                    res.status(201).json({
                        message: "Coordinator Created successfully",
                        user_id: user_id
                    });
                })
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    });
};

// -> List Coordinator
exports.getCoordinator = (req, res) => {
    const sql = `SELECT 
                    u.id AS user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    d.name AS department
                FROM users u
                JOIN coordinators c ON u.id = c.user_id
                JOIN departments d ON c.dept_id = d.id
                ORDER BY first_name
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });
        res.json(result);
    });
};


// 3. SUPERVISOR
// -> Create Supervisor
exports.createSupervisor = (req, res) => {
    const { first_name, last_name, email, password, dept_id, designation, expertise } = req.body;

    if (!first_name || !last_name || !email || !password || !dept_id || !designation || !expertise) {
        return res.status(400).json({ message: "All feilds are required" });
    }

    //ceck email
    const checksql = 'SELECT id FROM users where email = ?';

    db.query(checksql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (results.length > 0) {
            return res.status(500).json({ message: "Email already exists" });
        }

        try {
            const hashPass = await bcrypt.hash(password, 10);

            // create user
            db.query(usersql, [3, first_name, last_name, email, hashPass], (err, userResult) => {
                if (err) return res.status(500).json({ message: "Server Error2" });

                const user_id = userResult.insertId;

                // Inserting user to supervisor role
                const supsql = `INSERT INTO supervisors(user_id, dept_id, designation, expertise)
                VALUES (?, ?, ?, ?)`;

                db.query(supsql, [user_id, dept_id, designation, expertise], (err) => {
                    if (err) {
                        // ROLLBACK: delete created user
                        const deletesql = `DELETE FROM users WHERE id = ?`;

                        db.query(deletesql, [user_id], () => {
                            return res.status(500).json({ message: "Server Error3" });
                        });
                        return;
                    }

                    res.status(402).json({
                        message: "Supervisor created successfully",
                        user_id: user_id
                    });
                })
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    });
};

// List Supervisor
exports.getSupervisor = (req, res) => {
    const sql = `SELECT
                    s.id AS supervisor_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    d.name AS department
                FROM users u
                JOIN supervisors s ON s.user_id = u.id
                JOIN departments d ON s.dept_id = d.id
                ORDER BY u.first_name
                `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        // result
        res.json(result);

    });
};

// 4. Students
// List all students
exports.getAllStudents = (req, res) => {
    const sql = `
        SELECT 
            students.id,
            students.registration_no,
            students.research_area,
            students.enrollment_date,

            users.first_name,
            users.last_name,
            users.email,

            departments.name AS department_name,

            CONCAT(supUsers.first_name, ' ', supUsers.last_name) AS supervisor

        FROM students
        JOIN users ON students.user_id = users.id
        JOIN departments ON students.dept_id = departments.id

        LEFT JOIN supervisors ON students.supervisor_id = supervisors.id
        LEFT JOIN users AS supUsers ON supervisors.user_id = supUsers.id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        res.json(result);
    })
}


// 5. Examiners
// -> Create Examiner
exports.createExaminer = (req, res) => {
    const { first_name, last_name, email, password, dept_id, designation } = req.body;

    if (!first_name || !last_name || !email || !password || !dept_id || !designation) {
        return res.status(400).json({ message: "All feilds are required" });
    }

    db.query(checksql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        if (results.length > 0) {
            return res.status(409).json({ message: "Email already exist" });
        }

        try {
            const hashpass = await bcrypt.hash(password, 10);

            //create user
            db.query(usersql, [5, first_name, last_name, email, hashpass], (err, userResult) => {
                if (err) return res.status(500).json({ message: "Server Error2" });

                const user_id = userResult.insertId;

                const examinersql = `INSERT INTO examiners(user_id, dept_id, designation)
            VALUES (?, ?, ?)`;

                db.query(examinersql, [user_id, dept_id, designation], (err) => {
                    if (err) {
                        // ROLLBACK: delete created user
                        const deletesql = `DELETE FROM users WHERE id = ?`;

                        db.query(deletesql, [user_id], () => {
                            return res.status(500).json({ message: "Server Error3" });
                        });
                        return;
                    }

                    res.status(201).json({
                        message: "Examiner Created successfully",
                        user_id: user_id
                    });
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    });
};

// -> List Examiner
exports.getExaminer = (req, res) => {
    const sql = `
        SELECT
            u.id AS user_id,
            u.first_name,
            u.last_name,
            d.name AS department
        FROM users u
        JOIN examiners e ON u.id = e.user_id
        JOIN departments d ON e.dept_id = d.id 
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Server Error1" });

        //result
        res.json(result);
    });
};