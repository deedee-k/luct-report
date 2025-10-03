import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

let db; // DB connection
const SECRET = process.env.JWT_SECRET || "supersecret"; // keep safe in .env

// ---------------- INIT DB + SERVER ----------------
async function init() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "mysql.railway.internal",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "NPbilwChBilqRfQOQghVzZjsdQcSvHMe",
      database: process.env.DB_NAME || "railway",
      port: process.env.DB_PORT || 3306
    });

    console.log("✅ Connected to MySQL");

    // ---------------- ROUTES ----------------

    // Root
    app.get("/", (req, res) => res.send("API is running..."));

    // ----------- AUTH -----------

    // Register
    app.post("/api/register", async (req, res) => {
      try {
        const { name, email, password, role } = req.body;

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert into DB
        await db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
          [name, email, hashed, role || "student"]
        );

        res.json({ message: "User registered successfully" });
      } catch (err) {
        console.error("❌ Register error:", err);
        res.status(500).json({ error: "Registration failed" });
      }
    });

    // Login
    app.post("/api/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
        if (rows.length === 0) return res.status(400).json({ error: "User not found" });

        const user = rows[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        // Sign token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });

        res.json({
          token,
          user: { id: user.id, name: user.name, role: user.role }
        });
      } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // Auth middleware
    function authMiddleware(req, res, next) {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ error: "No token" });

      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    // Example protected route
    app.get("/api/me", authMiddleware, async (req, res) => {
      const [rows] = await db.query("SELECT id, name, role FROM users WHERE id=?", [req.user.id]);
      res.json(rows[0]);
    });

    // ----------- LECTURES -----------
    app.get("/api/lectures", async (req, res) => {
      const [rows] = await db.query("SELECT * FROM lectures");
      res.json(rows);
    });

    app.post("/api/lectures", async (req, res) => {
      const data = req.body;
      await db.query(
        `INSERT INTO lectures
         (faculty_name, class_name, week_of_reporting, date_of_lecture,
          course_name, course_code, lecturer_name, actual_students,
          total_students, venue, scheduled_time, topic, outcomes, recommendations)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          data.faculty_name,
          data.class_name,
          data.week_of_reporting,
          data.date_of_lecture,
          data.course_name,
          data.course_code,
          data.lecturer_name,
          data.actual_students,
          data.total_students,
          data.venue,
          data.scheduled_time,
          data.topic,
          data.outcomes,
          data.recommendations
        ]
      );
      res.json({ message: "Lecture added" });
    });
    // Add PRL feedback to a lecture
app.put("/api/lectures/:id/feedback", async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  await db.query("UPDATE lectures SET prl_feedback=? WHERE id=?", [feedback, id]);

  res.json({ message: "Feedback added" });
});

// Get average rating for each lecture
app.get("/api/lectures/with-ratings", async (req, res) => {
  const [rows] = await db.query(`
    SELECT l.*, 
           COALESCE(AVG(r.rating),0) as avg_rating,
           COUNT(r.id) as rating_count
    FROM lectures l
    LEFT JOIN ratings r ON l.id = r.lecture_id
    GROUP BY l.id
  `);
  res.json(rows);
});


    // ----------- RATINGS -----------
    app.post("/api/ratings", async (req, res) => {
      const { user_id, lecture_id, rating } = req.body;
      await db.query(
        "INSERT INTO ratings (user_id, lecture_id, rating) VALUES (?,?,?)",
        [user_id, lecture_id, rating]
      );
      res.json({ message: "Rating added" });
    });

    app.get("/api/ratings/:lectureId", async (req, res) => {
      const { lectureId } = req.params;
      const [rows] = await db.query(
        "SELECT * FROM ratings WHERE lecture_id=?",
        [lectureId]
      );
      res.json(rows);
    });

    // ---------------- START SERVER ----------------
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

app.get("/api/reports/excel", async (req, res) => {
  const [lectures] = await db.query(`
    SELECT l.*, 
           COALESCE(AVG(r.rating),0) as avg_rating,
           COUNT(r.id) as rating_count
    FROM lectures l
    LEFT JOIN ratings r ON l.id = r.lecture_id
    GROUP BY l.id
  `);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Lecture Reports");

  // Add header row
  sheet.addRow([
    "Course Name",
    "Course Code",
    "Lecturer",
    "Topic",
    "Actual Students",
    "Total Students",
    "PRL Feedback",
    "Average Rating",
    "Rating Count"
  ]);

  // Add lecture data
  lectures.forEach((lec) => {
    sheet.addRow([
      lec.course_name,
      lec.course_code,
      lec.lecturer_name,
      lec.topic,
      lec.actual_students,
      lec.total_students,
      lec.prl_feedback || "None",
      Number(lec.avg_rating).toFixed(1),
      lec.rating_count
    ]);
  });

  // Set headers for download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=reports.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

// Student-specific Excel report
app.get("/api/reports/student/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `SELECT l.course_name, l.course_code, l.lecturer_name, l.topic,
            l.date_of_lecture, r.rating
     FROM lectures l
     LEFT JOIN ratings r ON l.id = r.lecture_id AND r.user_id = ?`,
    [id]
  );

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("My Lectures & Ratings");

  // Header row
  sheet.addRow([
    "Course Name",
    "Course Code",
    "Lecturer",
    "Topic",
    "Date of Lecture",
    "My Rating"
  ]);

  // Data rows
  rows.forEach((lec) => {
    sheet.addRow([
      lec.course_name,
      lec.course_code,
      lec.lecturer_name,
      lec.topic,
      lec.date_of_lecture,
      lec.rating || "Not Rated"
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=student_report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});



init();
