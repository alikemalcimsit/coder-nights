require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./websocket/socketHandler');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// io instance'ı app üzerinden controller'lara eriştir
app.set('io', io);

initSocket(io);

// DB bağlantısını test et ve sunucuyu başlat
db.query('SELECT 1')
  .then(() => {
    console.log('[DB] MySQL bağlantısı başarılı');
    server.listen(PORT, () => {
      console.log(`[SERVER] MesajCell backend çalışıyor → http://localhost:${PORT}`);
      console.log(`[WS] WebSocket hazır → ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Bağlantı hatası:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] Kapatılıyor...');
  server.close(() => {
    db.end();
    process.exit(0);
  });
});
