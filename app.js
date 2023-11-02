const express = require("express");
const dotenv = require("dotenv");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

dotenv.config();

app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "https://d309-103-167-115-89.ngrok-free.app",
      "https://lets-talk-ab.netlify.app",
    ],
    credentials: true,
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
