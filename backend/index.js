const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import the MySQL connection

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Sample route to fetch data from MySQL
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
