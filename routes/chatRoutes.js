const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  removeGroup,
  addGroupMember,
} = require("../controllers/chatController");
const router = express.Router();

router.route("/").post(protect, accessChat).get(protect, getChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/group-remove").put(protect, removeGroup);
router.route("/group-add").put(protect, addGroupMember);

module.exports = router;
