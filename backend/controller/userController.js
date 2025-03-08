const db = require("../db");
const bcrypt = require("bcrypt");

const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Users");
        res.status(200).json({
            status: "success",
            results: rows.length,
            data: {
                users: rows,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const handleSignin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = rows[0];

        // Compare hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }

        res.cookie("token", user.id, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
            sameSite: "Strict",
        });

        return res.status(200).json({ message: "Signed in successfully", token: user.id });
    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const handleLogout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};

const handleSignup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "Please provide name, email, and password",
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
                message: "Please provide a valid email address",
            });
        }

        // Check if user already exists
        const [existingUsers] = await db.query("SELECT email FROM Users WHERE email = ?", [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({
                error: "Email is already in use",
                message: "The email address you entered is already associated with an existing account.",
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into database
        await db.query(
            "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)",
            [name, email.toLowerCase(), hashedPassword]
        );

        return res.status(201).json({
            message: "Signup successful. You can now sign in.",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            error: "Failed to create user",
            message: "An unexpected error occurred. Please try again.",
        });
    }
};

module.exports = {
    getUsers,
    handleSignup,
    handleSignin,
    handleLogout,
};
