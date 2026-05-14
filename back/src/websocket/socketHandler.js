const { verifyAccessToken } = require('../utils/jwt');
const channelRepo = require('../repositories/channelRepository');
const messageRepo = require('../repositories/messageRepository');
const userRepo = require('../repositories/userRepository');
const messageService = require('../services/messageService');

// user_id → Set<socket.id>
const userSockets = new Map();

const initSocket = (io) => {
  // JWT auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Token gerekli'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Geçersiz token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`[WS] Bağlandı: ${user.id}`);

    // Kullanıcı socket map'e ekle
    if (!userSockets.has(user.id)) userSockets.set(user.id, new Set());
    userSockets.get(user.id).add(socket.id);

    // Kullanıcının kanallarına otomatik join
    try {
      const channels = await channelRepo.getUserChannels(user.id, user.org_id);
      for (const ch of channels) {
        socket.join(ch.id);
      }
    } catch (e) {
      console.error('[WS] Kanal join hatası:', e.message);
    }

    // Online durumu güncelle
    await userRepo.updatePresence(user.id, 'ONLINE');
    io.emit('user:status', { user_id: user.id, presence_status: 'ONLINE' });

    // ──────────────────────────────────────────
    // message:send  →  mesaj gönder (WebSocket üzerinden)
    // ──────────────────────────────────────────
    socket.on('message:send', async (data, ack) => {
      try {
        const { channel_id, content, message_type, reply_to_message_id, attachment } = data;
        const msg = await messageService.sendMessage(user, channel_id, {
          content, message_type, reply_to_message_id, attachment,
        });
        io.to(channel_id).emit('message:new', msg);
        if (ack) ack({ success: true, message: msg });
      } catch (err) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // ──────────────────────────────────────────
    // message:edit
    // ──────────────────────────────────────────
    socket.on('message:edit', async (data, ack) => {
      try {
        const { message_id, content } = data;
        const msg = await messageService.editMessage(user, message_id, content);
        io.to(msg.channel_id).emit('message:edit', msg);
        if (ack) ack({ success: true, message: msg });
      } catch (err) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // ──────────────────────────────────────────
    // message:delete
    // ──────────────────────────────────────────
    socket.on('message:delete', async (data, ack) => {
      try {
        const { message_id } = data;
        const msg = await messageService.deleteMessage(user, message_id);
        io.to(msg.channel_id).emit('message:delete', {
          id: msg.id,
          channel_id: msg.channel_id,
          content: 'Bu mesaj silindi',
        });
        if (ack) ack({ success: true });
      } catch (err) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // ──────────────────────────────────────────
    // user:typing
    // ──────────────────────────────────────────
    socket.on('user:typing', (data) => {
      const { channel_id, is_typing } = data;
      socket.to(channel_id).emit('user:typing', {
        user_id: user.id,
        channel_id,
        is_typing: !!is_typing,
      });
    });

    // ──────────────────────────────────────────
    // user:status  →  kullanıcı durumunu değiştir
    // ──────────────────────────────────────────
    socket.on('user:status', async (data) => {
      const { presence_status } = data;
      const allowed = ['ONLINE', 'OFFLINE', 'BUSY'];
      if (!allowed.includes(presence_status)) return;
      await userRepo.updatePresence(user.id, presence_status);
      io.emit('user:status', { user_id: user.id, presence_status });
    });

    // ──────────────────────────────────────────
    // channel:join  →  dinamik kanal join
    // ──────────────────────────────────────────
    socket.on('channel:join', (channel_id) => {
      socket.join(channel_id);
    });

    // ──────────────────────────────────────────
    // read:receipt  →  okundu işareti
    // ──────────────────────────────────────────
    socket.on('read:receipt', async (data) => {
      const { channel_id, message_id } = data;
      await messageRepo.upsertReadReceipt(user.id, channel_id, message_id);
    });

    // ──────────────────────────────────────────
    // Bağlantı koptuğunda
    // ──────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[WS] Ayrıldı: ${user.id}`);
      const sockets = userSockets.get(user.id);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(user.id);
          await userRepo.updatePresence(user.id, 'OFFLINE');
          io.emit('user:status', { user_id: user.id, presence_status: 'OFFLINE' });
        }
      }
    });
  });
};

module.exports = { initSocket, userSockets };
