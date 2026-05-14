const express = require('express');
const cors = require('cors');
const { globalErrorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const orgRoutes = require('./routes/organizations');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/org', orgRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/search', searchRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
