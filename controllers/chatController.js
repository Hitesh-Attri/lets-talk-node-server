const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    // no userId in req body
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGoupChat: false,
    $and: [
      {
        users: { $elemMatch: { $eq: req.user._id } },
      },
      {
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGoupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const newChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: newChat._id }).populate(
        "users"
      );

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const getChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: {
        $elemMatch: { $eq: req.user._id },
      },
    })
      .populate("users")
      .populate("latestMessage")
      .populate("groupAdmin")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  console.log(req.body);
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 1) {
    return res.status(400).json({ message: "More than one user is required" });
  }

  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const FullChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(FullChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  // console.log(req.body);
  if (!chatId || !chatName) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");
  // console.log(updatedChat, "<");
  // return;

  if (!updatedChat) {
    return res.status(400).json({ message: "Chat not found" });
  } else {
    res.status(200).json(updatedChat);
  }
});

const removeGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  // console.log(req.body);

  const removed = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!removed) {
    return res.status(400).json({ message: "Chat not found" });
  } else {
    res.status(200).json(removed);
  }
});

const addGroupMember = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!added) {
    return res.status(400).json({ message: "Chat not found" });
  } else {
    res.status(200).json(added);
  }
});

module.exports = {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  removeGroup,
  addGroupMember,
};
