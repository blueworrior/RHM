const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { email, password } = req.body;

    // 1. Check if user exists
    const sql = `
        SELECT users.*, roles.name AS role
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password', result: results });
        }

        const user = results[0];

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password', password: password, userPassword: user.password });
        }

        // 3. Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Send response
        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    });
};
