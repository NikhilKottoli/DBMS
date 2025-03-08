const { Router } = require("express");
const { getUsers,handleSignup,handleSignin,handleLogout } = require("../controller/userController.js");

const router = Router();

router.get("/getUser", getUsers);
router.post("/signup", handleSignup);
router.post("/signin", handleSignin);
router.get("/logout", handleLogout);

module.exports = router;
