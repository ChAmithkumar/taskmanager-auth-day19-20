const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    category: String,
    priority: { type: String, default: "Medium" },
    dueDate: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);
