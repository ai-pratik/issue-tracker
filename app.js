const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Project = require("./models/projectModel");

const app = express();
const port = 9095;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://pratikgade:root@cluster0.nbi55bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const labels = ["Bug", "Feature", "Enhancement"];

// Middleware to handle common project details for routes
app.param("projectId", async (req, res, next, projectId) => {
  try {
    const project = await Project.findById(projectId).populate("issues");
    if (!project) {
      return res.redirect("/");
    }
    req.project = project;
    next();
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Routes
app.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.render("index", { projects, labels });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/create-project", (req, res) => {
  res.render("create-project");
});

app.post("/create-project", async (req, res) => {
  const { name, description, author } = req.body;
  try {
    const newProject = new Project({ name, description, author });
    await newProject.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/project/:projectId", async (req, res) => {
  const { project } = req;
  const projectLabels = project.labels || [];

  try {
    const issues = await Project.findById(project._id)
      .populate("issues")
      .select("issues");
    res.render("project-detail", {
      project,
      labels: projectLabels,
      issues: issues.issues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/create-issue/:projectId", (req, res) => {
  const { project, labels } = req;
  res.render("create-issue", { project, labels });
});

app.post("/create-issue/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { title, description, labels, author } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (project) {
      project.issues.push({
        title,
        description,
        labels: labels.split(","),
        author,
      });
      await project.save();
    }
    res.redirect(`/project/${projectId}`);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
