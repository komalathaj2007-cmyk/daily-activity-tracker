const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ==========================================
// Serve Frontend
// ==========================================

app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});


// ==========================================
// MongoDB Connection
// ==========================================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });


// ==========================================
// Activity Schema
// ==========================================

const activitySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    when: {
        type: String,
        default: "Today"
    },
    done: {
        type: Boolean,
        default: false
    }
});

const Activity = mongoose.model("Activity", activitySchema);


// ==========================================
// User Schema
// ==========================================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);


// ==========================================
// ACTIVITY CRUD
// ==========================================


// ==========================================
// GET - View activities
// ==========================================

app.get("/api/activities", async (req, res) => {
    try {

        const activities = await Activity.find();

        res.json(activities);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to load activities"
        });

    }
});


// ==========================================
// POST - Add activity
// ==========================================

app.post("/api/activities", async (req, res) => {
    try {

        const activity = await Activity.create({

            text: req.body.text,

            when: req.body.when,

            done: req.body.done || false

        });

        res.status(201).json(activity);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to add activity"
        });

    }
});


// ==========================================
// PUT - Update activity
// ==========================================

app.put("/api/activities/:id", async (req, res) => {
    try {

        const activity = await Activity.findByIdAndUpdate(

            req.params.id,

            req.body,

            { new: true }

        );

        if (!activity) {

            return res.status(404).json({
                message: "Activity not found"
            });

        }

        res.json(activity);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to update activity"
        });

    }
});


// ==========================================
// DELETE - Delete activity
// ==========================================

app.delete("/api/activities/:id", async (req, res) => {
    try {

        const activity = await Activity.findByIdAndDelete(
            req.params.id
        );

        if (!activity) {

            return res.status(404).json({
                message: "Activity not found"
            });

        }

        res.json(activity);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete activity"
        });

    }
});


// ==========================================
// USER REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            mobile,
            username,
            password
        } = req.body;


        // Check all fields

        if (
            !name ||
            !email ||
            !mobile ||
            !username ||
            !password
        ) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        // Check existing username

        const existingUser = await User.findOne({
            username: username
        });

        if (existingUser) {

            return res.status(409).json({
                message: "Username already exists"
            });

        }


        // Create user

        const user = await User.create({

            name: name,

            email: email,

            mobile: mobile,

            username: username,

            password: password

        });


        res.status(201).json({

            message: "Registration successful",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                mobile: user.mobile,

                username: user.username

            }

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Registration failed"
        });

    }

});


// ==========================================
// USER LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // Check fields

        if (!username || !password) {

            return res.status(400).json({
                message: "Please enter username and password"
            });

        }


        // Find user

        const user = await User.findOne({

            username: username,

            password: password

        });


        // Invalid login

        if (!user) {

            return res.status(401).json({
                message: "Invalid username or password"
            });

        }


        // Successful login

        res.json({

            message: "Login successful",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                mobile: user.mobile,

                username: user.username

            }

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Login failed"
        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Backend running at http://localhost:${PORT}`
    );

});