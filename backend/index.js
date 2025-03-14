const express = require("express");
const cors = require("cors");
const db = require("./db");
const userRouter = require("./routes/userRoutes.js");
const accountRouter = require("./routes/accountRoutes.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/account", accountRouter);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
