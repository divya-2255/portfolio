const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());                                  // read JSON sent by the browser
app.use(express.static(path.join(__dirname, "public")));  // serve HTML, CSS, JS files

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/portfolioDB")
  .then(() => {
    console.log("MongoDB connected");
    addSampleProjects();
  })
  .catch(err => console.log("DB error:", err.message));

// Schema and model: the structure of every project
const Project = mongoose.model("Project", new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String]
}));

// Schema and model: the structure of every contact message
const Contact = mongoose.model("Contact", new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
}));

// If the database has no projects yet, save three sample projects
async function addSampleProjects() {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.insertMany([
      {
        title: "Personal HTML Portfolio",
        description: "A portfolio website built using HTML and CSS.",
        technologies: ["HTML", "CSS"]
      },
      {
        title: "Statistics Calculator",
        description: "A beginner project for practising statistics.",
        technologies: ["JavaScript", "Statistics"]
      },
      {
        title: "Student Task Tracker",
        description: "A simple tool to organise tasks and deadlines.",
        technologies: ["HTML", "JavaScript"]
      }
    ]);
    console.log("Sample projects saved");
  }
}

// Route: get all projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Could not load projects" });
  }
});

// Route: save a contact message (with backend validation)
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ message: "Name must be at least 3 characters" });
  }
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ message: "Enter a valid email" });
  }
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ message: "Message must be at least 5 characters" });
  }

  try {
    await Contact.create({ name: name.trim(), email: email.trim(), message: message.trim() });
    res.json({ message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Could not save the message" });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
