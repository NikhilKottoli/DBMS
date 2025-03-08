const express = require("express");
const cors = require("cors");
const db = require("./db");
const userRouter = require("./routes/userRoutes.js");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
