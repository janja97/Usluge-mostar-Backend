const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// GET 
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('📩 GET /conversations called');
    console.log('👤 Authenticated user ID:', req.userId);

    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate({
        path: 'participants',
        select: 'fullName avatar'
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender receiver createdAt isRead'
      })
      .sort({ updatedAt: -1 });

    if (conversations.length === 0) return res.json([]);

    
    const formatted = conversations.map(conv => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== req.userId
      );

      return {
        _id: otherUser?._id,
        fullName: otherUser?.fullName,
        avatar: otherUser?.avatar,
        lastMessage: conv.lastMessage || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching conversations:', err);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

//  GET 
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ]
    })
      .populate('sender', 'fullName avatar')
      .populate('receiver', 'fullName avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// POST 
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content required' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content
    });

    await message.save();

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, receiverId],
        lastMessage: message._id
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
    }

    await conversation.save();

    const populatedMsg = await message.populate('sender receiver', 'fullName avatar');

    res.json(populatedMsg);
  } catch (err) {
    console.error('❌ Error sending message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
});

router.post('/markRead', auth, async (req, res) => {
  const { conversationWith } = req.body;
  if (!conversationWith) {
    return res.status(400).json({ message: 'conversationWith is required' });
  }

  try {
    await Message.updateMany(
      { sender: conversationWith, receiver: req.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read', err);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

module.exports = router;
