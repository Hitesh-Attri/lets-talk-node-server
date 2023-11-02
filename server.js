const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/userModel");

connectDB();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, (err) => {
  if (!err) console.log(`server running on ${PORT}`);
  else console.log("err occured", err);
});

const io = require("socket.io")(server, {
  pingTimout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("connnected to socket.io", socket.id);
  socket.on("setup", async (userData) => {
    userData.socketId = socket.id;

    await User.findByIdAndUpdate(userData._id, userData);

    socket.join(userData._id);
    socket.emit("connection");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room", room);
  });

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.off("setup", async () => {
    console.log("disconnected from socket.io");
    const user = await User.findOneAndUpdate(
      { socketId: socket.id },
      { $unset: { socketId: "" } }
    );
    console.log("User disconnected:", user);
    socket.leave(userData._id);
  });
});
