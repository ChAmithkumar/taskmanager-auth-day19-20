require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Task = require("./models/Task");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DB ================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================= ROOT ================= */
app.get("/", (req, res) => {
    res.send("API Running 🚀");
});

/* ================= AUTH ================= */

// SIGNUP
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields required" });
        }

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ msg: "Email exists" });

        const hash = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hash });
        await user.save();

        res.json({ msg: "Signup successful" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
        console.log(req.body);
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: "Wrong password" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ================= TASKS ================= */

// GET USER TASKS
app.get("/tasks", auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD TASK
app.post("/tasks", auth, async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            category: req.body.category,
            userId: req.user.id
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

axios.post(API + "/tasks", {
    title: taskInput.value,
    category: category.value,
    priority: priority.value,
    dueDate: dueDate.value
}, {
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
    }
});

// UPDATE TASK
app.put("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE TASK
app.delete("/tasks/:id", auth, async (req, res) => {
    try {
        await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        res.json({ msg: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
/* ================= START ================= */
app.listen(3000, () => console.log("Server running http://localhost:3000"));
