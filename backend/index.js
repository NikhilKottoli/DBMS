const express = require("express");
const cors = require("cors");
const db = require("./db");
const userRouter = require("./routes/userRoutes.js");
const accountRouter = require("./routes/accountRoutes.js");

const app = express();
const PORTS = [3000, 3010];

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/account", accountRouter);
app.get("/", (req, res) => res.send("Welcome to the backend!"));

// Try listening on available port
const tryListen = (ports) => {
  if (!ports.length) return console.error("No available ports!");

  const port = ports.shift();
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
    .on("error", (err) => err.code === "EADDRINUSE" && tryListen(ports));
};

tryListen([...PORTS]);
