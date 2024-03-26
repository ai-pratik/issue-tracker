// models/projectModel.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  issues: [
    { title: String, description: String, labels: [String], author: String },
  ],
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
