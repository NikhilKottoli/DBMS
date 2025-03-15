const {Router} = require("express");
const {openAccount,getAccount,withdraw,deposit} = require("../controller/accountController.js");

const router = Router();

router.post("/openAccount", openAccount);
router.get("/getAccount/:customerId", getAccount);
router.post("/withdraw/:accountId", withdraw);
router.post("/deposit/:accountId", deposit);

module.exports = router;