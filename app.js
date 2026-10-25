const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "dist", "Frontend")));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Employee Schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  }
});

const Employee = mongoose.model("Employee", employeeSchema);

// GET: Get all employees
app.get("/api/employeelist", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employees",
      error: error.message
    });
  }
});

// GET: Get single employee
app.get("/api/employeelist/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employee",
      error: error.message
    });
  }
});

// POST: Add employee
app.post("/api/employeelist", async (req, res) => {
  try {
    const { name, location, position, salary } = req.body;

    const employee = new Employee({
      name,
      location,
      position,
      salary
    });

    const savedEmployee = await employee.save();

    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({
      message: "Error adding employee",
      error: error.message
    });
  }
});

// DELETE: Delete employee
app.delete("/api/employeelist/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee deleted successfully",
      employee
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting employee",
      error: error.message
    });
  }
});

// PUT: Update employee
app.put("/api/employeelist", async (req, res) => {
  try {
    const { _id, name, location, position, salary } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Employee ID is required"
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      _id,
      {
        name,
        location,
        position,
        salary
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({
      message: "Error updating employee",
      error: error.message
    });
  }
});

// Don't delete this code.
// It connects the frontend file.
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "Frontend", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});