const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/services');
const favoritesRoutes = require('./routes/favorites');
const messagesRoutes = require('./routes/messages');

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/', (req, res) => res.send('✅ API is running'));

// Create HTTP server + Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map();

// JWT helper
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Socket auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Auth error: token missing'));

  const decoded = verifyToken(token.replace('Bearer ', ''));
  if (!decoded) return next(new Error('Auth error: invalid token'));

  socket.userId = decoded.id;
  next();
});

// 🔌 Socket events
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`⚡ User connected: ${userId}`);

  onlineUsers.set(userId.toString(), socket.id);

  // 💬 SEND MESSAGE
  socket.on('sendMessage', async (payload, ack) => {
    try {
      const { to, content } = payload;
      if (!to || !content) {
        if (ack) ack({ status: 'error', message: 'Missing data' });
        return;
      }

      // Create and save message
      const message = new Message({
        sender: userId,
        receiver: to,
        content
      });
      await message.save();

      // 🔁 Update or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, to] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, to],
          lastMessage: message._id
        });
      } else {
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
      }
      await conversation.save();

      const populatedMsg = await message
        .populate('sender', 'fullName avatar')
        .populate('receiver', 'fullName avatar');

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(to.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', populatedMsg);
      }

      // Emit back to sender
      socket.emit('newMessage', populatedMsg);

      if (ack) ack({ status: 'ok', message: populatedMsg });
    } catch (err) {
      console.error('❌ Error sending message:', err);
      if (ack) ack({ status: 'error', message: 'Server error' });
    }
  });

  // ✅ Mark messages as read
  socket.on('markRead', async ({ conversationWith }) => {
    try {
      if (!conversationWith) return;
      await Message.updateMany(
        { sender: conversationWith, receiver: userId, isRead: false },
        { $set: { isRead: true } }
      );
    } catch (err) {
      console.error('❌ Error marking read:', err);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId.toString());
    console.log(`⚡ User disconnected: ${userId}`);
  });
});

// Mongo connect + server start
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
