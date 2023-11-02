const asyncHandler = require("express-async-handler");
const schedule = require("node-schedule");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const getAllMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    return res.status(400).json({ message: "ChatId and content are required" });
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(
      { _id: req.body.chatId },
      {
        latestMessage: message,
      }
    );

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const scheduleMessage = asyncHandler(async (req, res) => {
  const { users, messageData, date } = req.body;
  if (!users || users.length === 0 || !messageData || !date) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  console.log(req.body);

  const chats = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, ...users] },
  }).select("_id");

  const chatIds = chats.map((chat) => chat._id);
  console.log(chatIds, "<--chatIds");

  const [year, month, day, hours, minutes] = date.split(/[-T:]/);
  const scheduleDate = new Date(year, month - 1, day, hours, minutes, 0);

  if (scheduleDate < new Date()) {
    return res
      .status(400)
      .json({ message: "Cannot schedule message for a past date" });
  }

  const jobs = [];
  for (const chatId of chatIds) {
    const job = schedule.scheduleJob(scheduleDate, async function () {
      let newMessage = {
        sender: req.user._id,
        content: messageData,
        chat: chatId,
      };

      let message = await Message.create(newMessage);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });

      await Chat.findByIdAndUpdate(
        { _id: chatId },
        {
          latestMessage: message,
        }
      );
    });

    // jobs.push(job);
    // console.log(jobs, "<--jobs");
  }

  res.json({ msg: "Message scheduled" });
});

module.exports = {
  getAllMessages,
  sendMessage,
  scheduleMessage,
};
