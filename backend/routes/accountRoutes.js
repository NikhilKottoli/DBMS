const {Router} = require("express");
const {openAccount,getAccount,withdraw,deposit,transfer, applyLoan, getMyLoans, getAllLoans, approveLoan} = require("../controller/accountController.js");

const router = Router();

router.post("/openAccount", openAccount);
router.get("/getAccount/:customerId", getAccount);
router.post("/withdraw/:accountId", withdraw);
router.post("/deposit/:accountId", deposit);
router.post("/transfer/:accountId", transfer);
router.post("/loan/:accountId", applyLoan); 
router.get("/getLoans/:accountId", getAllLoans);
router.get("/getMyLoans/:accountId", getMyLoans);
router.get("/approveLoan/:accountId", approveLoan);
module.exports = router;