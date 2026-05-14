# MesajCell Backend

Turkcell CodeNight 2026 — Kurumsal Anlık Mesajlaşma Platformu  
**Node.js + Express + Socket.io + MySQL**

---

## İçindekiler

1. [Teknoloji Stack](#teknoloji-stack)
2. [Proje Yapısı](#proje-yapısı)
3. [Mimari](#mimari)
4. [Kurulum](#kurulum)
5. [Ortam Değişkenleri](#ortam-değişkenleri)
6. [Başlatma](#başlatma)
7. [Auth Sistemi](#auth-sistemi)
8. [API Endpoint Referansı](#api-endpoint-referansı)
9. [WebSocket Referansı](#websocket-referansı)
10. [Veritabanı Katmanı](#veritabanı-katmanı)
11. [Rol ve Yetki Sistemi](#rol-ve-yetki-sistemi)
12. [Bildirim Sistemi](#bildirim-sistemi)
13. [Arama Sistemi](#arama-sistemi)
14. [Standard Response Formatı](#standard-response-formatı)

---

## Teknoloji Stack

| Paket | Versiyon | Kullanım Amacı |
|---|---|---|
| express | ^4.18 | HTTP sunucu ve routing |
| socket.io | ^4.7 | WebSocket / gerçek zamanlı iletişim |
| mysql2 | ^3.9 | MySQL bağlantısı (Promise tabanlı) |
| jsonwebtoken | ^9.0 | JWT access + refresh token üretimi |
| bcryptjs | ^2.4 | Şifre hash'leme |
| uuid | ^9.0 | UUID üretimi (tablo primary key'leri) |
| cors | ^2.8 | Cross-Origin istekleri |
| dotenv | ^16.4 | Ortam değişkenleri |
| express-validator | ^7.0 | Input doğrulama |
| nodemon | ^3.1 | Geliştirme: hot reload |

---

## Proje Yapısı

```
back/
├── src/
│   ├── config/
│   │   └── db.js                   MySQL connection pool
│   │
│   ├── repositories/               Veritabanı katmanı (ham SQL sorguları)
│   │   ├── authRepository.js       OTP, kullanıcı, session sorguları
│   │   ├── channelRepository.js    Kanal ve üyelik sorguları
│   │   ├── messageRepository.js    Mesaj, ek, mention, reaksiyon sorguları
│   │   ├── organizationRepository.js  Org ve davet sorguları
│   │   └── userRepository.js       Profil, bildirim, arama sorguları
│   │
│   ├── services/                   İş mantığı katmanı
│   │   ├── authService.js          Kayıt, OTP, JWT, session yönetimi
│   │   ├── channelService.js       Kanal oluşturma, join, invite, DM
│   │   ├── messageService.js       Mesaj gönder, düzenle, sil, ara
│   │   ├── organizationService.js  Org bilgisi, kullanıcı daveti
│   │   └── userService.js          Profil, bildirim, kullanıcı arama
│   │
│   ├── controllers/                HTTP istek/cevap katmanı
│   │   ├── authController.js
│   │   ├── channelController.js
│   │   ├── messageController.js
│   │   ├── organizationController.js
│   │   └── userController.js
│   │
│   ├── routes/                     Express Router tanımları
│   │   ├── auth.js                 /api/v1/auth/*
│   │   ├── channels.js             /api/v1/channels/*
│   │   ├── messages.js             /api/v1/messages/*
│   │   ├── organizations.js        /api/v1/org/*
│   │   ├── users.js                /api/v1/users/*
│   │   └── search.js               /api/v1/search
│   │
│   ├── middleware/
│   │   ├── auth.js                 JWT doğrulama, rol kontrolü
│   │   └── errorHandler.js         Global hata yakalama, input validasyon
│   │
│   ├── websocket/
│   │   └── socketHandler.js        Tüm Socket.io event'leri
│   │
│   ├── utils/
│   │   ├── jwt.js                  Token üretme ve doğrulama yardımcıları
│   │   └── response.js             Standart HTTP response formatı
│   │
│   ├── app.js                      Express uygulama kurulumu
│   └── server.js                   HTTP + WebSocket sunucu başlatma
│
├── .env                            Ortam değişkenleri (git'e eklenmez)
├── .env.example                    Ortam değişkenleri şablonu
├── .gitignore
└── package.json
```

---

## Mimari

Backend **3 katmanlı mimari** ile tasarlanmıştır:

```
HTTP İsteği
     │
     ▼
┌──────────────┐
│   Routes     │  → URL eşleştirme, middleware zinciri
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controllers  │  → İstek al, yanıt gönder (HTTP/WebSocket)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Services   │  → İş mantığı, yetki kontrolü, hata fırlatma
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Repositories │  → Veritabanı sorguları (SQL)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    MySQL     │
└──────────────┘
```

**WebSocket (Socket.io)** REST API ile aynı HTTP sunucusunu paylaşır.
Controller'lar `req.app.get('io')` ile io instance'ına erişerek REST endpoint'lerinden de broadcast yapabilir.

---

## Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.x
- npm

### Adımlar

```bash
# 1. Bağımlılıkları yükle
cd back
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env

# 3. Veritabanını oluştur
mysql -u root -p < ../db/migration.sql
mysql -u root -p < ../db/seed.sql
```

---

## Ortam Değişkenleri

`.env` dosyası:

```env
PORT=3000

# MySQL bağlantısı
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sifre123!
DB_NAME=mesajcell_db

# JWT
JWT_SECRET=mesajcell_super_secret_jwt_key_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=mesajcell_refresh_secret_2026
JWT_REFRESH_EXPIRES_IN=7d

# OTP Simülasyon
OTP_CODE=1234
OTP_EXPIRES_MINUTES=5
```

---

## Başlatma

```bash
# Geliştirme modu (hot reload)
npm run dev

# Prodüksiyon modu
npm start
```

Çıktı:
```
[DB] MySQL bağlantısı başarılı
[SERVER] MesajCell backend çalışıyor → http://localhost:3000
[WS] WebSocket hazır → ws://localhost:3000
```

Sağlık kontrolü:
```
GET http://localhost:3000/health
```

---

## Auth Sistemi

### Akış 1 — Yeni Organizasyon Kurar (Org Admin)

```
POST /api/v1/auth/register-admin
  → Organizasyon oluşturulur
  → Kullanıcı ORG_ADMIN rolüyle oluşturulur
  → OTP üretilir (simülasyon: 1234)

POST /api/v1/auth/verify-otp
  → OTP doğrulanır
  → access_token + refresh_token döner
```

### Akış 2 — Çalışan Kaydı

```
POST /api/v1/auth/register  { org_id, gsm_number, full_name, ... }
  → Kullanıcı EMPLOYEE rolüyle oluşturulur
  → OTP üretilir (simülasyon: 1234)

POST /api/v1/auth/verify-otp
  → Doğrulama tamamlanır, token döner
```

### Akış 3 — Sonraki Girişler (Şifre ile)

```
POST /api/v1/auth/login  { gsm_number, password }
  → access_token + refresh_token döner
```

### Token Yenileme

```
POST /api/v1/auth/refresh  { refresh_token }
  → Yeni access_token + refresh_token döner
  → Eski refresh_token geçersiz olur (rotation)
```

### OTP Simülasyonu

Gerçek SMS gönderimi yoktur. Tüm OTP kodları `.env` içindeki `OTP_CODE=1234` değeridir.

### JWT Payload Yapısı

```json
{
  "id": "kullanici-uuid",
  "org_id": "organizasyon-uuid",
  "role": "ORG_ADMIN | EMPLOYEE"
}
```

Tüm korumalı endpoint'lerde header şu formatta gönderilmelidir:

```
Authorization: Bearer <access_token>
```

---

## API Endpoint Referansı

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| POST | `/register-admin` | Hayır | Yeni org + admin hesabı oluştur |
| POST | `/register` | Hayır | Çalışan kaydı (org_id zorunlu) |
| POST | `/verify-otp` | Hayır | OTP doğrula → JWT al |
| POST | `/login` | Hayır | Şifre ile giriş |
| POST | `/refresh` | Hayır | Token yenile |
| POST | `/logout` | Hayır | Oturumu kapat |
| POST | `/resend-otp` | Hayır | OTP tekrar gönder |

**register-admin örneği:**
```json
{
  "gsm_number": "+905301234567",
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@sirket.com",
  "password": "Sifre123!",
  "org_name": "Şirket Adı",
  "org_domain": "sirket.com",
  "org_logo": "https://cdn.example.com/logo.png"
}
```

**verify-otp örneği:**
```json
{
  "gsm_number": "+905301234567",
  "otp_code": "1234"
}
```

---

### Organizasyon — `/api/v1/org`

| Method | Endpoint | Rol | Açıklama |
|---|---|---|---|
| GET | `/` | Tümü | Kendi organizasyonumu getir |
| GET | `/users` | Tümü | Organizasyondaki tüm kullanıcılar |
| POST | `/invite` | ORG_ADMIN | Kullanıcı davet et |
| GET | `/accept-invite?token=` | Tümü | Daveti kabul et |

**invite örneği:**
```json
{
  "email": "yeni@sirket.com",
  "gsm_number": "+905309876543"
}
```

Yanıt:
```json
{
  "invite_token": "uuid",
  "invite_link": "http://localhost:3000/api/v1/org/accept-invite?token=uuid",
  "expires_at": "2026-05-15T18:00:00.000Z"
}
```

---

### Kanallar — `/api/v1/channels`

| Method | Endpoint | Rol | Açıklama |
|---|---|---|---|
| GET | `/` | Tümü | Üye olduğum kanalları listele |
| GET | `/public` | Tümü | Organizasyondaki public kanallar |
| POST | `/` | Tümü | Yeni kanal oluştur |
| POST | `/dm` | Tümü | DM başlat |
| GET | `/:id/members` | Üye | Kanal üyelerini listele |
| POST | `/:id/join` | Tümü | Public kanala katıl |
| POST | `/:id/invite` | Kanal Admin / Org Admin | Private kanala kullanıcı davet et |
| DELETE | `/:id/members/:userId` | Kanal Admin / Org Admin | Üyeyi kanaldan çıkar |
| PATCH | `/:id/notification-preference` | Üye | Bildirim tercihini güncelle |
| GET | `/:id/messages?page=N` | Üye | Mesaj geçmişi (sayfa başına 30 mesaj) |
| POST | `/:id/messages` | Üye | Mesaj gönder (REST fallback) |
| GET | `/:id/pinned` | Üye | Sabitlenmiş mesajlar |
| POST | `/:channelId/pin/:id` | Kanal Admin | Mesaj sabitle |

**Kanal oluşturma:**
```json
{
  "name": "proje-alpha",
  "description": "Alpha projesi geliştirme kanalı",
  "type": "PUBLIC",
  "icon_url": "https://cdn.example.com/icons/rocket.png"
}
```

**DM başlatma:**
```json
{
  "target_user_id": "hedef-kullanici-uuid"
}
```

**Bildirim tercihi:**
```json
{
  "preference": "ALL | MENTIONS_ONLY | MUTED"
}
```

---

### Mesajlar — `/api/v1/messages`

| Method | Endpoint | Açıklama |
|---|---|---|
| PATCH | `/:id` | Mesaj düzenle |
| DELETE | `/:id` | Mesaj sil (soft delete) |
| POST | `/:id/reactions` | Emoji reaksiyon ekle |
| DELETE | `/:id/reactions` | Reaksiyon kaldır |

Silinen mesajın içeriği `"Bu mesaj silindi"` olarak değişir, `is_deleted = 1` olur.

**Dosya eki ile mesaj (REST):**
```json
{
  "content": "Raporu paylaşıyorum",
  "message_type": "FILE",
  "attachment": {
    "file_name": "rapor-q1.pdf",
    "file_size": 245000,
    "mime_type": "application/pdf",
    "file_url": "https://cdn.example.com/files/rapor-q1.pdf",
    "thumbnail_url": null
  }
}
```

**Yanıtlama (Reply):**
```json
{
  "content": "Harika bir fikir!",
  "reply_to_message_id": "yanıtlanan-mesaj-uuid"
}
```

Response'da `reply_content` ve `reply_sender_name` alanları dolu gelir.

---

### Arama — `/api/v1/search`

| Parametre | Açıklama |
|---|---|
| `q` | Arama terimi (min 2 karakter) |
| `channel_id` | Belirli bir kanalda ara (opsiyonel) |
| `type=users` | Kullanıcı arama modu |

```
GET /api/v1/search?q=merhaba
GET /api/v1/search?q=merhaba&channel_id=kanal-uuid
GET /api/v1/search?q=ahmet&type=users
GET /api/v1/search?q=+9053&type=users
```

---

### Kullanıcılar — `/api/v1/users`

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/me` | Kendi profilim |
| PATCH | `/me` | Profil güncelle |
| GET | `/search?q=` | Kullanıcı ara |
| GET | `/notifications` | Bildirimlerim |
| PATCH | `/notifications/read` | Bildirimleri okundu işaretle |

---

## WebSocket Referansı

### Bağlantı

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "access_token_buraya" },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
```

Bağlantı kurulduğunda sunucu otomatik olarak kullanıcının tüm kanallarına join eder ve `ONLINE` durumunu yayar.

---

### Client → Server (Gönderilen)

#### `message:send`
```javascript
socket.emit("message:send", {
  channel_id: "kanal-uuid",
  content: "Merhaba!",
  message_type: "TEXT",           // TEXT | FILE | IMAGE | SYSTEM
  reply_to_message_id: null,      // opsiyonel
  attachment: null                // opsiyonel
}, (response) => {
  // { success: true, message: {...} }
});
```

Dosya eki ile:
```javascript
socket.emit("message:send", {
  channel_id: "kanal-uuid",
  content: "Dosyayı paylaşıyorum",
  message_type: "FILE",
  attachment: {
    file_name: "sunum.pptx",
    file_size: 1048576,
    mime_type: "application/vnd.ms-powerpoint",
    file_url: "https://cdn.example.com/files/sunum.pptx",
    thumbnail_url: null
  }
});
```

#### `message:edit`
```javascript
socket.emit("message:edit", {
  message_id: "mesaj-uuid",
  content: "Düzenlenmiş içerik"
}, (response) => { });
```

#### `message:delete`
```javascript
socket.emit("message:delete", {
  message_id: "mesaj-uuid"
}, (response) => { });
```

#### `user:typing`
```javascript
socket.emit("user:typing", { channel_id: "uuid", is_typing: true });
socket.emit("user:typing", { channel_id: "uuid", is_typing: false });
```

#### `user:status`
```javascript
socket.emit("user:status", { presence_status: "ONLINE" }); // ONLINE | OFFLINE | BUSY
```

#### `channel:join` — Yeni katıldığın kanala dinamik join
```javascript
socket.emit("channel:join", "kanal-uuid");
```

#### `read:receipt` — Okundu bildirimi
```javascript
socket.emit("read:receipt", {
  channel_id: "kanal-uuid",
  message_id: "son-okunan-mesaj-uuid"
});
```

---

### Server → Client (Alınan)

#### `message:new`
```javascript
socket.on("message:new", (message) => {
  // {
  //   id, channel_id, sender_id, content, message_type,
  //   reply_to_message_id, is_edited, is_deleted, created_at,
  //   sender_name, sender_photo, sender_status,
  //   reply_content, reply_sender_name,
  //   attachments: [{ file_name, file_size, mime_type, file_url, thumbnail_url }]
  // }
});
```

#### `message:edit`
```javascript
socket.on("message:edit", (message) => {
  // Güncellenmiş message objesi, is_edited: 1
});
```

#### `message:delete`
```javascript
socket.on("message:delete", (data) => {
  // { id, channel_id, content: "Bu mesaj silindi" }
});
```

#### `user:typing`
```javascript
socket.on("user:typing", (data) => {
  // { user_id, channel_id, is_typing: true|false }
});
```

#### `user:status`
```javascript
socket.on("user:status", (data) => {
  // { user_id, presence_status: "ONLINE"|"OFFLINE"|"BUSY" }
});
```

#### `message:reaction`
```javascript
socket.on("message:reaction", (data) => {
  // { message_id, reactions: [{ emoji, count, users }] }
});
```

---

## Veritabanı Katmanı

### Tablolar ve Amaçları

| Tablo | Açıklama |
|---|---|
| `organizations` | Şirket bilgileri |
| `users` | Kullanıcı hesapları, roller, durum |
| `channels` | Kanallar (PUBLIC, PRIVATE, DM) |
| `channel_members` | Kanal üyelikleri ve bildirim tercihleri |
| `messages` | Mesajlar (soft-delete destekli, FULLTEXT index) |
| `message_attachments` | Dosya ekleri (metadata simülasyonu) |
| `message_mentions` | @mention kayıtları |
| `message_reactions` | Emoji reaksiyonları (bonus) |
| `message_threads` | Thread alt konuşmaları (bonus) |
| `notifications` | MENTION / MESSAGE / CHANNEL_INVITE bildirimleri |
| `organization_invitations` | Davet linkleri (24 saat geçerli) |
| `otp_verifications` | OTP kodları ve geçerlilik süresi |
| `pinned_messages` | Sabitlenmiş mesajlar (bonus) |
| `read_receipts` | Kullanıcı başına son okunan mesaj |
| `user_sessions` | Refresh token oturumları (rotation) |

### Kritik İndeksler

```sql
INDEX idx_message_channel_created (channel_id, created_at)  -- sayfalı sorgular
FULLTEXT INDEX ft_message_content (content)                 -- mesaj arama
INDEX idx_user_gsm (gsm_number)                             -- OTP, login
INDEX idx_notification_user (user_id)                       -- bildirim listesi
```

---

## Rol ve Yetki Sistemi

### Kullanıcı Rolleri (`users.role`)

| Rol | Özel Yetkiler |
|---|---|
| `ORG_ADMIN` | Kullanıcı davet, her kanala müdahale, üye yönetimi |
| `EMPLOYEE` | Mesaj gönder/al, public kanala katıl, DM |

### Kanal Rolleri (`channel_members.role`)

| Rol | Yetkiler |
|---|---|
| `CHANNEL_ADMIN` | Üye ekle/çıkar, mesaj sabitle |
| `MEMBER` | Mesaj gönder/al, dosya paylaş |

### Yetki Matrisi

| İşlem | EMPLOYEE | CHANNEL_ADMIN | ORG_ADMIN |
|---|---|---|---|
| Public kanal oluştur | ✅ | ✅ | ✅ |
| Private kanal oluştur | ❌ | ❌ | ✅ |
| Public kanala join | ✅ | ✅ | ✅ |
| Private kanala invite | ❌ | ✅ | ✅ |
| Üye çıkar | ❌ | ✅ | ✅ |
| Kendi mesajını sil | ✅ | ✅ | ✅ |
| Başkasının mesajını sil | ❌ | ✅ | ✅ |
| Mesaj sabitle | ❌ | ✅ | ✅ |
| Kullanıcı davet et (org) | ❌ | ❌ | ✅ |

---

## Bildirim Sistemi

### Mention Formatı

```
@[Kullanıcı Adı](kullanici-uuid) toplantıya katılacak mısın?
```

Backend bu pattern'i parse edip `message_mentions` ve `notifications` tablolarına kayıt oluşturur.

### Okunmamış Sayaç

`read_receipts` tablosu her kullanıcı-kanal çifti için son okunan mesajı saklar.
`GET /api/v1/channels/:id/messages` çağrısı otomatik olarak receipt günceller.

### Kanal Bildirim Tercihleri

| Değer | Davranış |
|---|---|
| `ALL` | Her yeni mesajda bildirim |
| `MENTIONS_ONLY` | Sadece @mention'da bildirim |
| `MUTED` | Hiç bildirim yok |

---

## Arama Sistemi

### Mesaj Araması

MySQL `FULLTEXT INDEX` kullanır:

```sql
MATCH(content) AGAINST('*arama_terimi*' IN BOOLEAN MODE)
```

- Organizasyon izole: Farklı org'un mesajları görülemez
- Min 2 karakter gerektirir
- `channel_id` parametresiyle belirli kanala sınırlandırılabilir
- Sonuçlarda kanal adı, gönderen adı, zaman bilgisi yer alır

### Kullanıcı Araması

`full_name` ve `gsm_number` üzerinde `LIKE` sorgusu (org bazlı).

---

## Standard Response Formatı

**Başarılı:**
```json
{
  "success": true,
  "message": "İşlem açıklaması",
  "data": { }
}
```

**Hata:**
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "errors": [ ]
}
```

| HTTP Kodu | Durum |
|---|---|
| 200 | Başarılı |
| 201 | Kaynak oluşturuldu |
| 400 | Geçersiz input |
| 401 | Token gerekli / geçersiz |
| 403 | Yetki yok |
| 404 | Kaynak bulunamadı |
| 409 | Çakışma (zaten kayıtlı vb.) |
| 500 | Sunucu hatası |
