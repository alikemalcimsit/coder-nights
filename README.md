# MesajCell — Kurumsal Anlık Mesajlaşma Platformu

> Turkcell CodeNight 2026 Hackathon Projesi

MesajCell, Turkcell GSM kimlik doğrulaması ile çalışan, kanal bazlı mesajlaşma, dosya paylaşımı, gerçek zamanlı iletim ve mesaj arama özelliklerini barındıran kurumsal bir iletişim platformudur.

---

## Teknoloji Stack

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18 | REST API framework |
| Socket.io | 4.7 | WebSocket / Gerçek zamanlı iletişim |
| MySQL2 | 3.9 | Veritabanı driver |
| JWT | 9.0 | Kimlik doğrulama |
| bcryptjs | 2.4 | Şifre hash |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| Flutter | Cross-platform mobil uygulama |
| Riverpod | State management |
| Socket.io Client | WebSocket bağlantısı |
| Dio | HTTP client |

### Veritabanı
| Servis | Açıklama |
|--------|----------|
| Aiven MySQL | Bulut veritabanı |

### Deploy
| Servis | Açıklama |
|--------|----------|
| Render | Backend hosting |

---

## Proje Yapısı

```
coder-nights/
├── back/                          # Backend
│   ├── src/
│   │   ├── app.js                 # Express app
│   │   ├── server.js              # HTTP + Socket.io sunucu
│   │   ├── config/
│   │   │   └── db.js              # MySQL bağlantısı
│   │   ├── routes/                # API rotaları
│   │   │   ├── auth.js
│   │   │   ├── channels.js
│   │   │   ├── messages.js
│   │   │   ├── organizations.js
│   │   │   ├── users.js
│   │   │   └── search.js
│   │   ├── controllers/           # İstek/yanıt yönetimi
│   │   ├── services/              # İş mantığı
│   │   ├── repositories/          # Veritabanı sorguları
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT doğrulama
│   │   │   └── errorHandler.js
│   │   ├── websocket/
│   │   │   └── socketHandler.js   # Socket.io event'leri
│   │   └── utils/
│   │       ├── jwt.js
│   │       └── response.js
│   ├── MesajCell.postman_collection.json
│   └── package.json
├── db/
│   ├── migration.sql              # Tablo şemaları
│   └── seed.sql                   # Örnek veriler
└── README.md
```

---

## Özellikler

### Zorunlu Özellikler
- **Kullanıcı & Organizasyon Yönetimi**
  - Organizasyon oluşturma (ad, logo, domain)
  - GSM numarası ile kayıt + OTP doğrulama (simülasyon: 1234)
  - JWT + Refresh Token kimlik doğrulama
  - Rol bazlı erişim: ORG_ADMIN, EMPLOYEE, CHANNEL_ADMIN
  - Davet linki ile kullanıcı ekleme

- **Kanal & Mesajlaşma**
  - PUBLIC / PRIVATE / DM kanal tipleri
  - Mesaj gönderme, düzenleme, soft delete
  - Sayfalı mesaj geçmişi (30 mesaj/sayfa)
  - Inline reply (mesaj yanıtlama)

- **Gerçek Zamanlı İletim (WebSocket)**
  - Socket.io ile anlık mesaj iletimi
  - Yazıyor... göstergesi
  - Online/Offline/Meşgul durum güncelleme
  - Otomatik yeniden bağlanma

- **Dosya Paylaşımı & Arama**
  - Metadata simülasyonu ile dosya paylaşımı
  - Full-text mesaj arama
  - Kullanıcı arama

- **Bildirim Sistemi**
  - Okunmamış mesaj sayacı
  - @mention bildirimi
  - Kanal bazlı bildirim tercihi (ALL / MENTIONS_ONLY / MUTED)

### Bonus Özellikler
- Emoji reaksiyon
- Mesaj sabitleme (pin)
- Online kullanıcı listesi

---

## Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.x veya Aiven MySQL
- npm

### 1. Repoyu Klonla

```bash
git clone https://github.com/alikemalcimsit/coder-nights.git
cd coder-nights/back
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
# Sunucu
PORT=3000
NODE_ENV=development

# Veritabanı
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sifre
DB_NAME=mesajcell
DB_SSL=false

# JWT
JWT_ACCESS_SECRET=gizli-access-secret
JWT_REFRESH_SECRET=gizli-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# OTP Simülasyon
OTP_CODE=1234
OTP_EXPIRES_MINUTES=5

# Frontend URL (davet linkleri için)
FRONTEND_URL=http://localhost:3001
```

### 4. Veritabanını Hazırla

```bash
# Migration (tablolar)
mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE < ../db/migration.sql

# Seed (örnek veriler)
mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE < ../db/seed.sql
```

### 5. Sunucuyu Başlat

```bash
# Production
npm start

# Development (hot reload)
npm run dev
```

Sunucu `http://localhost:3000` adresinde çalışır.

---

## API Dokümantasyonu

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Korumalı endpointler için:
```
Authorization: Bearer {access_token}
```

### Response Formatı
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { }
}
```

### Endpoint Özeti

#### Auth
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | /auth/register-admin | Org + admin oluştur | ❌ |
| POST | /auth/register | Çalışan kaydı (invite_token ile) | ❌ |
| POST | /auth/verify-otp | OTP doğrula, JWT döner | ❌ |
| POST | /auth/login | Şifre ile giriş | ❌ |
| POST | /auth/refresh | Token yenile | ❌ |
| POST | /auth/logout | Çıkış | ✅ |
| POST | /auth/resend-otp | OTP tekrar gönder | ❌ |

#### Channels
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /channels | Kanallarımı listele | ✅ |
| GET | /channels/public | Public kanallar | ✅ |
| POST | /channels | Kanal oluştur | ✅ |
| POST | /channels/dm | DM başlat | ✅ |
| GET | /channels/:id/members | Kanal üyeleri | ✅ |
| POST | /channels/:id/join | Kanala katıl | ✅ |
| POST | /channels/:id/invite | Üye davet et | ✅ |
| DELETE | /channels/:id/members/:userId | Üye çıkar | ✅ |
| PATCH | /channels/:id/members/:userId/role | Rol güncelle | ✅ |
| PATCH | /channels/:id/notification-preference | Bildirim tercihi | ✅ |
| GET | /channels/:id/messages | Mesaj geçmişi | ✅ |
| POST | /channels/:id/messages | Mesaj gönder (REST) | ✅ |
| GET | /channels/:id/pinned | Sabitlenmiş mesajlar | ✅ |
| POST | /channels/:channelId/pin/:id | Mesaj sabitle | ✅ |

#### Messages
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| PATCH | /messages/:id | Mesaj düzenle | ✅ |
| DELETE | /messages/:id | Mesaj sil | ✅ |
| POST | /messages/:id/reactions | Reaksiyon ekle | ✅ |
| DELETE | /messages/:id/reactions | Reaksiyon kaldır | ✅ |

#### Organization
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /org | Organizasyon bilgisi | ✅ |
| GET | /org/users | Org kullanıcıları | ✅ |
| POST | /org/invite | Kullanıcı davet et | ✅ |
| GET | /org/invite-info | Davet bilgisi (token ile) | ❌ |
| GET | /org/accept-invite | Daveti kabul et | ✅ |

#### Users
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /users/me | Profilim | ✅ |
| PATCH | /users/me | Profil güncelle | ✅ |
| GET | /users/search | Kullanıcı ara | ✅ |
| GET | /users/notifications | Bildirimler | ✅ |
| PATCH | /users/notifications/read | Okundu işaretle | ✅ |

#### Search
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /search?q=&type=messages | Mesaj ara | ✅ |
| GET | /search?q=&type=users | Kullanıcı ara | ✅ |

---

## WebSocket Events

### Bağlantı
```js
const socket = io('http://localhost:3000', {
  auth: { token: 'access_token' }
})
```

### Client → Server
| Event | Data | Açıklama |
|-------|------|----------|
| message:send | { channel_id, content, reply_to_message_id, attachment } | Mesaj gönder |
| message:edit | { message_id, content } | Mesaj düzenle |
| message:delete | { message_id } | Mesaj sil |
| user:typing | { channel_id, is_typing } | Yazıyor bildirimi |
| user:status | { presence_status } | Durum güncelle |
| channel:join | channel_id | Kanala katıl |
| read:receipt | { channel_id, message_id } | Okundu işareti |

### Server → Client
| Event | Data | Açıklama |
|-------|------|----------|
| message:new | { id, channel_id, sender_id, sender_name, content, ... } | Yeni mesaj |
| message:edit | { id, channel_id, content, updated_at } | Düzenlenen mesaj |
| message:delete | { id, channel_id, content: 'Bu mesaj silindi' } | Silinen mesaj |
| user:typing | { user_id, channel_id, is_typing } | Yazıyor göstergesi |
| user:status | { user_id, presence_status } | Kullanıcı durumu |

---

## Kullanıcı Rolleri

| Rol | Açıklama | Yetkiler |
|-----|----------|----------|
| ORG_ADMIN | Şirket yöneticisi | Her şey |
| CHANNEL_ADMIN | Kanal oluşturan | Kanal yönetimi |
| EMPLOYEE | Normal kullanıcı | Mesaj gönderme |

---

## OTP Simülasyon

Gerçek SMS gönderimi yoktur. Tüm OTP kodları: **1234**

---

## Postman Collection

`back/MesajCell.postman_collection.json` dosyasını Postman'e import edin.

Collection Variables:
- `base_url` → https://coder-nights.onrender.com
- `access_token` → verify-otp veya login sonrası otomatik dolar
- `refresh_token` → otomatik dolar
- `channel_id` → kanal oluşturulunca otomatik dolar

---

## Canlı Demo

- **Backend:** https://coder-nights.onrender.com
- **Health Check:** https://coder-nights.onrender.com/health

---

## Takım

Turkcell CodeNight 2026 — MesajCell Ekibi
