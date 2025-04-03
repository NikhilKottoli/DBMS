const { Router } = require("express");
const { getUsers,handleSignup,handleSignin,handleLogout, getUser,Logs} = require("../controller/userController.js");

const router = Router();

router.get("/getUser", getUsers);
router.post("/signup", handleSignup);
router.post("/signin", handleSignin);
router.get("/logout", handleLogout);
router.get("/getUser/:customer_id", getUser);
router.get("/logs",Logs);

module.exports = router;
