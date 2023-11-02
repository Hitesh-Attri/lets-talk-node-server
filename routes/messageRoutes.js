const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getAllMessages,
  scheduleMessage,
} = require("../controllers/messageControllers");
const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, getAllMessages);
router.route("/schedule").post(protect, scheduleMessage);

module.exports = router;
