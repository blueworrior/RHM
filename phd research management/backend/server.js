const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const db = require('./config/db')

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); //serve PDFs

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coordinator',require('./routes/coordinate'));
app.use('/api/supervisor', require('./routes/supervisor'));
app.use('/api/student',require('./routes/student'));
app.use('/api/examiner',require('./routes/examiner'));
app.use('/uploads', express.static('uploads'));


app.listen(PORT, ()=> console.log(`Server running on PORT ${5000}`));


//----------Dummies------------

// jwt Test
const auth = require('./middleware/authMiddleware')
app.get('/api/test', auth, (req, res)=> {
    res.json({message: 'JWT Working', user: req.user})
})

db.query('SELECT * FROM users', (err, results) => {
    if(err) console.log(err);
    else console.log('Users:', results);
});
