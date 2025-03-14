const db = require("../db");
const bcrypt = require("bcrypt");

const openAccount = async (req, res) => {
    const { customer_id, account_type, balence } = req.body;
    try {
        const callProcedureQuery = 'CALL open_account(?, ?, ?);';
        await db.query(callProcedureQuery, [customer_id, account_type, balence]);

        const selectQuery = `
            SELECT account_number AS accountId 
            FROM accounts 
            WHERE customer_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1;
        `;
        const [rows] = await db.query(selectQuery, [customer_id]);
        const accountId = rows[0]?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Failed to open account' });
        }
        return res.status(200).json({ accountId });
    } catch (error) {
        console.error("Open account error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const getAccount = async (req, res) => {
    const { customerId } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM accounts WHERE customer_id = ?", [customerId]);
        res.status(200).json({
            status: "success",
            results: rows.length,
            data: {
                accounts: rows,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports =  { openAccount,getAccount };