const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const sql = `
            SELECT 
                users.id,
                users.first_name,
                users.last_name,
                users.password,
                users.is_super_admin,
                roles.name AS role
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE users.email = ?
        `;

        const [results] = await db.promise().query(sql, [email]);

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // ✅ TOKEN WITH SUPER ADMIN
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                is_super_admin: !!user.is_super_admin   // converts 1 → true
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                is_super_admin: !!user.is_super_admin
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });
    }
};
