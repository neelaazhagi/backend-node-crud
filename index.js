const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

const sampleFile = "./sample.json";

// ✅ Helper to get latest data
const getUsers = () => {
  const data = fs.readFileSync(sampleFile, "utf8");
  return JSON.parse(data);
};

// ✅ GET all users
app.get("/users", (req, res) => {
  const users = getUsers();
  res.json(users);
});

// ✅ ADD user
app.post("/users", (req, res) => {
  const { name, age, city } = req.body;

  if (!name || !age || !city) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = getUsers();
  const id = Date.now();
  const newUser = { id, name, age, city };
  users.push(newUser);

  fs.writeFile(sampleFile, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).json({ message: "Failed to save user" });
    }

    console.log(`✅ User added: ${name}`);
    res.status(201).json(users);
  });
});

// ✅ DELETE user
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  let users = getUsers();

  const userExists = users.some((u) => u.id === id);
  if (!userExists) {
    return res.status(404).json({ error: "User not found" });
  }

  const filteredUsers = users.filter((u) => u.id !== id);

  fs.writeFile(sampleFile, JSON.stringify(filteredUsers, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    console.log(`✅ User with ID ${id} deleted`);
    res.json(filteredUsers);
  });
});

// ✅ UPDATE user
app.patch("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, age, city } = req.body;

  let users = getUsers();
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex] = { ...users[userIndex], name, age, city };

  fs.writeFile(sampleFile, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).json({ message: "Failed to update user" });
    }

    console.log(`✅ User with ID ${id} updated`);
    res.json(users);
  });
});

app.listen(8000, () => console.log("✅ Server running on port 8000"));
