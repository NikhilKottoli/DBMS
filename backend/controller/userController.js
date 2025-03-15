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

const getUser = async (req, res) => {
    try {
        const {customer_id} = req.params;

        // Fetch user details
        const [userRows] = await db.query(
            "SELECT * FROM customers WHERE customer_id = ?", 
            [customer_id]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        // Fetch accounts linked to the user
        const [accounts] = await db.query(
            "SELECT * FROM accounts WHERE customer_id = ?", 
            [customer_id]
        );
        if (accounts.length === 0) {
            return res.status(200).json({
                status: "success",
                data: {
                    user: userRows[0],
                    accounts: [],
                    transactions: []
                },
            });
        }
        const accountIds = accounts.map(acc => acc.account_id);
        const [transactions] = await db.query(
            "SELECT * FROM transactions WHERE source_id IN (?) OR destination_id IN (?)", 
            [accountIds, accountIds]
        );
        res.status(200).json({
            status: "success",
            data: {
                user: userRows[0],
                accounts,
                transactions,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const handleSignin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const callProcedureQuery = 'CALL signin_user(?, ?);';
        const [rows] =await db.query(callProcedureQuery, [email, password]);
        console.log("rows:", rows);
        const customerId = rows[0][0]?.customerId;
        console.log("customerId:", customerId);
        if (!customerId) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        res.cookie("id",customerId, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
            sameSite: "Strict",
        });

        return res.status(200).json({id : customerId});
    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const handleLogout = (req, res) => {
    console.log("Logging out");    
    res.clearCookie("id");
    return res.status(200).json({ message: "Logged out successfully" });
};

const handleSignup = async (req, res) => {
    const { firstName, lastName, email, phone, address, password } = req.body;
    try {
        if (!firstName || !email || !password) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "Please provide first name, email, and password",
            });
        }
        const [rows] =await db.query(
                'select validate_email(?) as isvalid',[email]
        );
        if (rows[0].isvalid === 0) {
            return res.status(400).json({
                error: "Invalid email",
                message: "Invalid email format",
            });
        }
        await db.query(
            'CALL signup_user(?, ?, ?, ?, ?, ?, @customerId);',
            [firstName, lastName, email, phone, address, password]
        );

        const selectQuery = 'SELECT @customerId AS customerId;';
        const [rows1] = await db.query(selectQuery);
        const customerId = rows1[0].customerId;
        if (!customerId) {
            return res.status(400).json({
                error: "Signup failed",
                message: "An unexpected error occurred during signup.",
            });
        }

        return res.status(201).json({
            message: "Signup successful. You can now sign in.",
        });
    } catch (error) { 
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};


module.exports = {
    getUsers,
    handleSignup,
    handleSignin,
    handleLogout,
    getUser,
};
