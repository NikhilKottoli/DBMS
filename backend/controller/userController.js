const db = require("../db");
const bcrypt = require("bcrypt");

const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM customers");
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
        const [rows] = await db.query("SELECT * FROM customers WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = rows[0];

        // Compare hashed password
        const match = await bcrypt.compare(password, user.hashed_pswd);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }

        else console.log("User found");

        res.cookie("token", user.customer_id, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
            sameSite: "Strict",
        });

        console

        return res.status(200).json({token: user.customer_id });
    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const handleLogout = (req, res) => {
    console.log("Logging out");    
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};

const handleSignup = async (req, res) => {
    const { firstName,lastName, email, password } = req.body;

    try {
        if (!firstName || !email || !password) {
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
        const [existingUsers] = await db.query("SELECT email FROM customers WHERE email = ?", [email]);

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
            "INSERT INTO customers (first_name,last_name, email, hashed_pswd) VALUES (?, ?, ?, ?)",
            [firstName,lastName, email.toLowerCase(), hashedPassword]
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
