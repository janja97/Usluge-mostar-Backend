const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// ------------------- GET CONVERSATIONS -------------------
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.userId })
      .populate({ path: 'lastMessage', select: 'content sender receiver type createdAt isRead' })
      .sort({ updatedAt: -1 });

    if (!conversations.length) return res.json([]);

    const formatted = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p.toString() !== req.userId);
      return {
        _id: otherUser,
        lastMessage: conv.lastMessage || null
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching conversations:', err);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// ------------------- GET MESSAGES -------------------
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    });

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(),
      total: totalMessages
    });
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// ------------------- SEND MESSAGE -------------------
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { receiverId, content, type } = req.body;

    if (!receiverId || !content)
      return res.status(400).json({ message: 'Receiver and content required' });

    let finalType = type || (content.startsWith('data:image/') ? 'image' : 'text');
    let finalContent = content;

    if (finalType === 'image' && !content.startsWith('data:image/')) {
      finalContent = `data:image/jpeg;base64,${content}`;
    }

    const message = new Message({
      sender: userId,
      receiver: receiverId,
      content: finalContent,
      type: finalType
    });

    await message.save();

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, receiverId],
        lastMessage: message._id
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
    }

    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- MARK AS READ -------------------
router.post('/markRead', auth, async (req, res) => {
  const { conversationWith } = req.body;
  if (!conversationWith) return res.status(400).json({ message: 'conversationWith is required' });

  try {
    await Message.updateMany(
      { sender: conversationWith, receiver: req.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// ------------------- GET UNREAD COUNT -------------------
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('❌ Error fetching unread count:', err);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

module.exports = router;
