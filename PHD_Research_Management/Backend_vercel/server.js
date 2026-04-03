const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "*", // you can lock this later to Netlify domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Database (Supabase PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Make DB available in routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/coordinator", require("./routes/coordinator"));
app.use("/api/supervisor", require("./routes/supervisor"));
app.use("/api/student", require("./routes/student"));
app.use("/api/examiner", require("./routes/examiner"));

// Test route
const auth = require("./middleware/authMiddleware");
app.get("/api/test", auth, (req, res) => {
  res.json({ message: "JWT Working", user: req.user });
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
}); 


// ❌ IMPORTANT: DO NOT USE app.listen in Vercel
// app.listen(PORT, () => console.log(`Server running`));

module.exports = app; 