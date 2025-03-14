const {Router} = require("express");
const {openAccount,getAccount} = require("../controller/accountController.js");

const router = Router();

router.post("/openAccount", openAccount);
router.get("/getAccount/:customerId", getAccount);

module.exports = router;