const db = require("../db");


const openAccount = async (req, res) => {
    const { customer_id, account_type, balance } = req.body;
    try {
        const callProcedureQuery = 'CALL open_account(?, ?, ?);';
        const [rows] =await db.query(callProcedureQuery, [customer_id, account_type, balance]);
        const accountId = rows[0][0]?.accountId;
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
    console.log(req.params);
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

const withdraw = async (req, res) => {
    const { amount } = req.body;
    const { accountId } = req.params;
    console.log(req.params);
    try {
        const callProcedureQuery = 'CALL withdraw_money(?, ?);';
        await db.query(callProcedureQuery, [parseInt(accountId, 10), parseInt(amount, 10)]);
        return res.status(200).json({ message: "Withdraw successful" });
    } catch (error) {
        console.error("Withdraw error:", error);
        return res.status(500).json({ error: error.message });
    }
}

const deposit = async (req, res) => {
    const { amount } = req.body;
    const { accountId } = req.params;
    try {
        const callProcedureQuery = 'CALL deposit_money(?, ?);';
        await db.query(callProcedureQuery, [parseInt(accountId, 10), parseInt(amount, 10)]);
        return res.status(200).json({ message: "Deposit successful" });
    } catch (error) {
        console.error("Deposit error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


module.exports =  { openAccount,getAccount,withdraw,deposit };