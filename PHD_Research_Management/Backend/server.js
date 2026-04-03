const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const db = require('./config/db')

// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://rhm-production-ad6d.up.railway.app"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); //serve PDFs

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coordinator',require('./routes/coordinator'));
app.use('/api/supervisor', require('./routes/supervisor'));
app.use('/api/student',require('./routes/student'));
app.use('/api/examiner',require('./routes/examiner'));
app.use('/uploads', express.static('uploads'));


app.listen(PORT, ()=> console.log(`Server running on PORT ${PORT}`));


//----------Dummies------------

// jwt Test
const auth = require('./middleware/authMiddleware')
app.get('/api/test', auth, (req, res)=> {
    res.json({message: 'JWT Working', user: req.user})
})

// running backend shows
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// db.query('SELECT * FROM users', (err, results) => {
//     if(err) console.log(err);
//     else console.log('Users:', results);
// });
