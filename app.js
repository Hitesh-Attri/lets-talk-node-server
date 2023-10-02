const express = require("express");
const chats = require("./data/data");
const dotenv = require("dotenv");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

dotenv.config();

app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.get("/", (req, res) => {
  res.send("get request");
});

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
