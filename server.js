const express = require("express");
const chats = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const app = express();
dotenv.config();

connectDB();

const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("get request");
});

app.get("/api/chats", (req, res) => {
  res.send(chats);
});

app.get("/api/chats/:id", (req, res) => {
  // console.log(req.params.id);
  const singleChat = chats.find((c) => c._id === req.params.id);
  res.json(singleChat);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (!err) console.log(`server running on ${PORT}`);
  else console.log("err occured", err);
});
