-- ============================================================
-- MesajCell Seed Data
-- 1 organizasyon, 10 kullanıcı, 5 kanal, 50+ mesaj
-- OTP simülasyon kodu: 1234
-- ============================================================

USE `defaultdb`;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- -----------------------------------------------------
-- Organizasyon
-- -----------------------------------------------------
INSERT INTO `organizations` (`id`, `name`, `logo_url`, `domain`, `created_by`, `created_at`) VALUES
('org-00000-turkcell-0001', 'Turkcell Teknoloji', 'https://cdn.mesajcell.com/logos/turkcell.png', 'turkcell.com.tr', NULL, '2026-01-01 09:00:00');

-- -----------------------------------------------------
-- Kullanıcılar (10 kişi)
-- password_hash = bcrypt("Sifre123!") placeholder
-- -----------------------------------------------------
INSERT INTO `users` (`id`, `org_id`, `full_name`, `gsm_number`, `email`, `password_hash`, `profile_photo_url`, `status_message`, `presence_status`, `role`, `otp_verified`, `last_seen`) VALUES
('usr-00001-admin-00001', 'org-00000-turkcell-0001', 'Ahmet Yılmaz',    '+905301000001', 'ahmet.yilmaz@turkcell.com.tr',    '$2b$10$dummyhashAhmetYilmaz000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/ahmet.jpg',   'Yönetici modunda',       'ONLINE',  'ORG_ADMIN', 1, NOW()),
('usr-00002-user-000002', 'org-00000-turkcell-0001', 'Elif Demir',      '+905301000002', 'elif.demir@turkcell.com.tr',      '$2b$10$dummyhashElifDemir00000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/elif.jpg',    'Frontend geliştirici',   'ONLINE',  'EMPLOYEE',  1, NOW()),
('usr-00003-user-000003', 'org-00000-turkcell-0001', 'Mehmet Kaya',     '+905301000003', 'mehmet.kaya@turkcell.com.tr',     '$2b$10$dummyhashMehmetKaya0000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/mehmet.jpg',  'Backend geliştirici',    'BUSY',    'EMPLOYEE',  1, NOW()),
('usr-00004-user-000004', 'org-00000-turkcell-0001', 'Zeynep Arslan',   '+905301000004', 'zeynep.arslan@turkcell.com.tr',   '$2b$10$dummyhashZeynepArslan000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/zeynep.jpg', 'DevOps mühendisi',       'OFFLINE', 'EMPLOYEE',  1, '2026-05-14 08:30:00'),
('usr-00005-user-000005', 'org-00000-turkcell-0001', 'Can Özkan',       '+905301000005', 'can.ozkan@turkcell.com.tr',       '$2b$10$dummyhashCanOzkan000000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/can.jpg',     'Mobile developer',       'ONLINE',  'EMPLOYEE',  1, NOW()),
('usr-00006-user-000006', 'org-00000-turkcell-0001', 'Ayşe Çelik',     '+905301000006', 'ayse.celik@turkcell.com.tr',      '$2b$10$dummyhashAyseCelik00000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/ayse.jpg',    'QA mühendisi',           'ONLINE',  'EMPLOYEE',  1, NOW()),
('usr-00007-user-000007', 'org-00000-turkcell-0001', 'Burak Şahin',    '+905301000007', 'burak.sahin@turkcell.com.tr',     '$2b$10$dummyhashBurakSahin0000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/burak.jpg',   'Data engineer',          'OFFLINE', 'EMPLOYEE',  1, '2026-05-14 07:00:00'),
('usr-00008-user-000008', 'org-00000-turkcell-0001', 'Selin Yıldız',   '+905301000008', 'selin.yildiz@turkcell.com.tr',    '$2b$10$dummyhashSelinYildiz000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/selin.jpg',   'Scrum master',           'ONLINE',  'EMPLOYEE',  1, NOW()),
('usr-00009-user-000009', 'org-00000-turkcell-0001', 'Emre Aydın',     '+905301000009', 'emre.aydin@turkcell.com.tr',      '$2b$10$dummyhashEmreAydin00000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/emre.jpg',    'Security analyst',       'BUSY',    'EMPLOYEE',  1, NOW()),
('usr-00010-user-000010', 'org-00000-turkcell-0001', 'Deniz Koç',      '+905301000010', 'deniz.koc@turkcell.com.tr',       '$2b$10$dummyhashDenizKoc000000000000000000000000000000', 'https://cdn.mesajcell.com/avatars/deniz.jpg',   'Product manager',        'ONLINE',  'EMPLOYEE',  1, NOW());

-- Org created_by güncelle
UPDATE `organizations` SET `created_by` = 'usr-00001-admin-00001' WHERE `id` = 'org-00000-turkcell-0001';

-- -----------------------------------------------------
-- Kanallar (5 kanal)
-- -----------------------------------------------------
INSERT INTO `channels` (`id`, `org_id`, `name`, `description`, `type`, `created_by`, `created_at`) VALUES
('ch-00001-genel-000001', 'org-00000-turkcell-0001', 'genel',           'Tüm şirket duyuruları ve genel konuşmalar',     'PUBLIC',  'usr-00001-admin-00001', '2026-01-01 09:05:00'),
('ch-00002-backend-0001', 'org-00000-turkcell-0001', 'backend-takimi',  'Backend ekip kanalı',                            'PUBLIC',  'usr-00003-user-000003', '2026-01-02 10:00:00'),
('ch-00003-frontend-001', 'org-00000-turkcell-0001', 'frontend-takimi', 'Frontend ekip kanalı',                           'PUBLIC',  'usr-00002-user-000002', '2026-01-02 10:05:00'),
('ch-00004-devops-00001', 'org-00000-turkcell-0001', 'devops',          'CI/CD, infrastructure ve deployment konuları',    'PRIVATE', 'usr-00004-user-000004', '2026-01-03 08:00:00'),
('ch-00005-random-00001', 'org-00000-turkcell-0001', 'random',          'Off-topic sohbetler, eğlence',                   'PUBLIC',  'usr-00001-admin-00001', '2026-01-03 09:00:00');

-- DM kanalları (2 tane)
INSERT INTO `channels` (`id`, `org_id`, `name`, `description`, `type`, `created_by`, `created_at`) VALUES
('ch-dm001-ahmet-elif01', 'org-00000-turkcell-0001', 'dm-ahmet-elif',   NULL, 'DM', 'usr-00001-admin-00001', '2026-01-05 10:00:00'),
('ch-dm002-mehmet-can01', 'org-00000-turkcell-0001', 'dm-mehmet-can',   NULL, 'DM', 'usr-00003-user-000003', '2026-01-05 11:00:00');

-- -----------------------------------------------------
-- Kanal Üyelikleri
-- -----------------------------------------------------
-- genel: herkes
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-001', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'CHANNEL_ADMIN'),
('cm-002', 'ch-00001-genel-000001', 'usr-00002-user-000002', 'MEMBER'),
('cm-003', 'ch-00001-genel-000001', 'usr-00003-user-000003', 'MEMBER'),
('cm-004', 'ch-00001-genel-000001', 'usr-00004-user-000004', 'MEMBER'),
('cm-005', 'ch-00001-genel-000001', 'usr-00005-user-000005', 'MEMBER'),
('cm-006', 'ch-00001-genel-000001', 'usr-00006-user-000006', 'MEMBER'),
('cm-007', 'ch-00001-genel-000001', 'usr-00007-user-000007', 'MEMBER'),
('cm-008', 'ch-00001-genel-000001', 'usr-00008-user-000008', 'MEMBER'),
('cm-009', 'ch-00001-genel-000001', 'usr-00009-user-000009', 'MEMBER'),
('cm-010', 'ch-00001-genel-000001', 'usr-00010-user-000010', 'MEMBER');

-- backend-takimi
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-011', 'ch-00002-backend-0001', 'usr-00003-user-000003', 'CHANNEL_ADMIN'),
('cm-012', 'ch-00002-backend-0001', 'usr-00001-admin-00001', 'MEMBER'),
('cm-013', 'ch-00002-backend-0001', 'usr-00007-user-000007', 'MEMBER'),
('cm-014', 'ch-00002-backend-0001', 'usr-00009-user-000009', 'MEMBER');

-- frontend-takimi
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-015', 'ch-00003-frontend-001', 'usr-00002-user-000002', 'CHANNEL_ADMIN'),
('cm-016', 'ch-00003-frontend-001', 'usr-00005-user-000005', 'MEMBER'),
('cm-017', 'ch-00003-frontend-001', 'usr-00008-user-000008', 'MEMBER'),
('cm-018', 'ch-00003-frontend-001', 'usr-00010-user-000010', 'MEMBER');

-- devops (private)
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-019', 'ch-00004-devops-00001', 'usr-00004-user-000004', 'CHANNEL_ADMIN'),
('cm-020', 'ch-00004-devops-00001', 'usr-00003-user-000003', 'MEMBER'),
('cm-021', 'ch-00004-devops-00001', 'usr-00009-user-000009', 'MEMBER');

-- random
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-022', 'ch-00005-random-00001', 'usr-00001-admin-00001', 'CHANNEL_ADMIN'),
('cm-023', 'ch-00005-random-00001', 'usr-00002-user-000002', 'MEMBER'),
('cm-024', 'ch-00005-random-00001', 'usr-00005-user-000005', 'MEMBER'),
('cm-025', 'ch-00005-random-00001', 'usr-00006-user-000006', 'MEMBER'),
('cm-026', 'ch-00005-random-00001', 'usr-00010-user-000010', 'MEMBER');

-- DM üyelikleri
INSERT INTO `channel_members` (`id`, `channel_id`, `user_id`, `role`) VALUES
('cm-027', 'ch-dm001-ahmet-elif01', 'usr-00001-admin-00001', 'MEMBER'),
('cm-028', 'ch-dm001-ahmet-elif01', 'usr-00002-user-000002', 'MEMBER'),
('cm-029', 'ch-dm002-mehmet-can01', 'usr-00003-user-000003', 'MEMBER'),
('cm-030', 'ch-dm002-mehmet-can01', 'usr-00005-user-000005', 'MEMBER');

-- -----------------------------------------------------
-- Mesajlar (50+ mesaj)
-- -----------------------------------------------------

-- ===== #genel kanalı (20 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-001', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'Herkese merhaba! MesajCell platformuna hoş geldiniz.', 'TEXT', NULL, '2026-01-01 09:10:00'),
('msg-002', 'ch-00001-genel-000001', 'usr-00002-user-000002', 'Merhaba! Harika bir platform olmuş.', 'TEXT', NULL, '2026-01-01 09:12:00'),
('msg-003', 'ch-00001-genel-000001', 'usr-00003-user-000003', 'Selam herkese, backend tarafında her şey hazır.', 'TEXT', NULL, '2026-01-01 09:15:00'),
('msg-004', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'Bu hafta sprint planlamamız Çarşamba günü saat 10:00 da yapılacak.', 'TEXT', NULL, '2026-01-02 08:30:00'),
('msg-005', 'ch-00001-genel-000001', 'usr-00005-user-000005', 'Toplantı linki paylaşılacak mı?', 'TEXT', 'msg-004', '2026-01-02 08:35:00'),
('msg-006', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'Evet, toplantı öncesi link gönderilecek.', 'TEXT', 'msg-005', '2026-01-02 08:37:00'),
('msg-007', 'ch-00001-genel-000001', 'usr-00006-user-000006', 'Test ortamı güncellendi, herkes kontrol etsin lütfen.', 'TEXT', NULL, '2026-01-02 11:00:00'),
('msg-008', 'ch-00001-genel-000001', 'usr-00008-user-000008', 'Sprint velocity raporunu paylaşıyorum.', 'FILE', NULL, '2026-01-03 09:00:00'),
('msg-009', 'ch-00001-genel-000001', 'usr-00004-user-000004', 'Deployment pipeline düzeltildi, artık sorunsuz çalışıyor.', 'TEXT', NULL, '2026-01-03 14:20:00'),
('msg-010', 'ch-00001-genel-000001', 'usr-00010-user-000010', 'Yeni özellik listesi için backlog grooming yapalım.', 'TEXT', NULL, '2026-01-04 10:00:00'),
('msg-011', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'Cuma günü demo günü, herkes hazırlıklı olsun!', 'TEXT', NULL, '2026-01-06 09:00:00'),
('msg-012', 'ch-00001-genel-000001', 'usr-00002-user-000002', 'UI mockupları hazır, Figma linkini paylaşıyorum.', 'TEXT', NULL, '2026-01-06 11:30:00'),
('msg-013', 'ch-00001-genel-000001', 'usr-00007-user-000007', 'Veri analiz raporu hazırlandı.', 'FILE', NULL, '2026-01-07 08:45:00'),
('msg-014', 'ch-00001-genel-000001', 'usr-00003-user-000003', 'API dokümantasyonu güncellendi.', 'TEXT', NULL, '2026-01-07 13:00:00'),
('msg-015', 'ch-00001-genel-000001', 'usr-00009-user-000009', 'Güvenlik taraması tamamlandı, kritik bulgu yok.', 'TEXT', NULL, '2026-01-08 10:00:00'),
('msg-016', 'ch-00001-genel-000001', 'usr-00005-user-000005', '@Ahmet Yılmaz release tarihi kesinleşti mi?', 'TEXT', NULL, '2026-01-08 14:30:00'),
('msg-017', 'ch-00001-genel-000001', 'usr-00001-admin-00001', 'Release 15 Ocak olarak planlandı.', 'TEXT', 'msg-016', '2026-01-08 14:35:00'),
('msg-018', 'ch-00001-genel-000001', 'usr-00006-user-000006', 'Regression testleri başladı.', 'TEXT', NULL, '2026-01-09 09:00:00'),
('msg-019', 'ch-00001-genel-000001', 'usr-00008-user-000008', 'Retro toplantısı bugün saat 16:00 da.', 'TEXT', NULL, '2026-01-09 11:00:00'),
('msg-020', 'ch-00001-genel-000001', 'usr-00010-user-000010', 'Harika sprint geçirdik, tebrikler ekip!', 'TEXT', NULL, '2026-01-10 17:00:00');

-- ===== #backend-takimi kanalı (10 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-021', 'ch-00002-backend-0001', 'usr-00003-user-000003', 'WebSocket sunucusu kurulumu tamamlandı.', 'TEXT', NULL, '2026-01-02 10:10:00'),
('msg-022', 'ch-00002-backend-0001', 'usr-00009-user-000009', 'JWT token expiry süresini 1 saate indirelim.', 'TEXT', NULL, '2026-01-02 11:00:00'),
('msg-023', 'ch-00002-backend-0001', 'usr-00003-user-000003', 'Refresh token mekanizması da ekleyelim o zaman.', 'TEXT', 'msg-022', '2026-01-02 11:05:00'),
('msg-024', 'ch-00002-backend-0001', 'usr-00007-user-000007', 'Redis cache entegrasyonu hazır, PR açtım.', 'TEXT', NULL, '2026-01-03 09:30:00'),
('msg-025', 'ch-00002-backend-0001', 'usr-00001-admin-00001', 'PR inceledim, approve ettim.', 'TEXT', 'msg-024', '2026-01-03 10:00:00'),
('msg-026', 'ch-00002-backend-0001', 'usr-00003-user-000003', 'Message pagination endpoint i hazır: GET /api/v1/channels/:id/messages?page=N', 'TEXT', NULL, '2026-01-04 08:00:00'),
('msg-027', 'ch-00002-backend-0001', 'usr-00009-user-000009', 'Rate limiting middleware ekledim, dakikada 100 request.', 'TEXT', NULL, '2026-01-04 14:00:00'),
('msg-028', 'ch-00002-backend-0001', 'usr-00003-user-000003', 'Full-text search MySQL FULLTEXT ile çalışıyor, test sonuçları iyi.', 'TEXT', NULL, '2026-01-05 09:00:00'),
('msg-029', 'ch-00002-backend-0001', 'usr-00007-user-000007', 'Database migration scriptleri güncellendi.', 'TEXT', NULL, '2026-01-05 11:00:00'),
('msg-030', 'ch-00002-backend-0001', 'usr-00001-admin-00001', 'Backend API v1 tamamlandı, tebrikler!', 'TEXT', NULL, '2026-01-06 16:00:00');

-- ===== #frontend-takimi kanalı (8 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-031', 'ch-00003-frontend-001', 'usr-00002-user-000002', 'React projesi oluşturuldu, Vite + TypeScript kullanıyoruz.', 'TEXT', NULL, '2026-01-02 10:10:00'),
('msg-032', 'ch-00003-frontend-001', 'usr-00005-user-000005', 'React Native tarafında da proje hazır.', 'TEXT', NULL, '2026-01-02 10:30:00'),
('msg-033', 'ch-00003-frontend-001', 'usr-00002-user-000002', 'Sidebar component tasarımı bitti.', 'IMAGE', NULL, '2026-01-03 09:00:00'),
('msg-034', 'ch-00003-frontend-001', 'usr-00008-user-000008', 'WebSocket client hookları yazıldı, real-time mesaj çalışıyor.', 'TEXT', NULL, '2026-01-04 11:00:00'),
('msg-035', 'ch-00003-frontend-001', 'usr-00010-user-000010', 'Kullanıcı araştırması sonuçlarını paylaşıyorum.', 'FILE', NULL, '2026-01-04 15:00:00'),
('msg-036', 'ch-00003-frontend-001', 'usr-00005-user-000005', 'Push notification entegrasyonu tamamlandı (mobil).', 'TEXT', NULL, '2026-01-05 10:00:00'),
('msg-037', 'ch-00003-frontend-001', 'usr-00002-user-000002', 'Dark mode desteği eklendi!', 'TEXT', NULL, '2026-01-06 09:30:00'),
('msg-038', 'ch-00003-frontend-001', 'usr-00008-user-000008', 'E2E testler Cypress ile yazıldı, CI a eklendi.', 'TEXT', NULL, '2026-01-06 14:00:00');

-- ===== #devops kanalı (7 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-039', 'ch-00004-devops-00001', 'usr-00004-user-000004', 'Kubernetes cluster ayağa kalktı.', 'TEXT', NULL, '2026-01-03 08:10:00'),
('msg-040', 'ch-00004-devops-00001', 'usr-00004-user-000004', 'CI/CD pipeline: GitHub Actions + ArgoCD.', 'TEXT', NULL, '2026-01-03 09:00:00'),
('msg-041', 'ch-00004-devops-00001', 'usr-00003-user-000003', 'Backend Docker image boyutu 180MB, optimize edebilir miyiz?', 'TEXT', NULL, '2026-01-03 10:00:00'),
('msg-042', 'ch-00004-devops-00001', 'usr-00004-user-000004', 'Multi-stage build ile 85MB ye düşürdüm.', 'TEXT', 'msg-041', '2026-01-03 12:00:00'),
('msg-043', 'ch-00004-devops-00001', 'usr-00009-user-000009', 'SSL sertifikaları yenilendi, Let''s Encrypt otomatik renewal aktif.', 'TEXT', NULL, '2026-01-04 08:00:00'),
('msg-044', 'ch-00004-devops-00001', 'usr-00004-user-000004', 'Monitoring stack kuruldu: Prometheus + Grafana.', 'TEXT', NULL, '2026-01-05 09:00:00'),
('msg-045', 'ch-00004-devops-00001', 'usr-00003-user-000003', 'Staging ortamı hazır, test edebilirsiniz.', 'TEXT', NULL, '2026-01-05 15:00:00');

-- ===== #random kanalı (5 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-046', 'ch-00005-random-00001', 'usr-00005-user-000005', 'Bugün öğle yemeği siparişi verelim mi?', 'TEXT', NULL, '2026-01-03 11:30:00'),
('msg-047', 'ch-00005-random-00001', 'usr-00006-user-000006', 'Pizza olsun bence!', 'TEXT', 'msg-046', '2026-01-03 11:32:00'),
('msg-048', 'ch-00005-random-00001', 'usr-00002-user-000002', 'Ben de katılıyorum, margarita lütfen.', 'TEXT', 'msg-046', '2026-01-03 11:33:00'),
('msg-049', 'ch-00005-random-00001', 'usr-00010-user-000010', 'CodeNight için hazırlıklar nasıl gidiyor?', 'TEXT', NULL, '2026-01-08 16:00:00'),
('msg-050', 'ch-00005-random-00001', 'usr-00001-admin-00001', 'Her şey yolunda, takım hazır!', 'TEXT', 'msg-049', '2026-01-08 16:05:00');

-- ===== DM mesajları (5 mesaj) =====
INSERT INTO `messages` (`id`, `channel_id`, `sender_id`, `content`, `message_type`, `reply_to_message_id`, `created_at`) VALUES
('msg-051', 'ch-dm001-ahmet-elif01', 'usr-00001-admin-00001', 'Elif, yeni tasarımlar çok güzel olmuş, tebrikler!', 'TEXT', NULL, '2026-01-05 10:05:00'),
('msg-052', 'ch-dm001-ahmet-elif01', 'usr-00002-user-000002', 'Teşekkürler Ahmet bey! Geri bildirimleriniz çok değerli.', 'TEXT', 'msg-051', '2026-01-05 10:08:00'),
('msg-053', 'ch-dm001-ahmet-elif01', 'usr-00001-admin-00001', 'Cuma demo için hazır mısın?', 'TEXT', NULL, '2026-01-06 09:00:00'),
('msg-054', 'ch-dm002-mehmet-can01', 'usr-00003-user-000003', 'Can, API entegrasyonunda bir sorun var mı?', 'TEXT', NULL, '2026-01-05 11:05:00'),
('msg-055', 'ch-dm002-mehmet-can01', 'usr-00005-user-000005', 'Hayır, sorunsuz çalışıyor. Auth header ını kontrol etmem yeterliydi.', 'TEXT', 'msg-054', '2026-01-05 11:10:00');

-- -----------------------------------------------------
-- Dosya Ekleri (FILE/IMAGE mesajları için)
-- -----------------------------------------------------
INSERT INTO `message_attachments` (`id`, `message_id`, `file_name`, `file_size`, `mime_type`, `file_url`, `thumbnail_url`) VALUES
('att-001', 'msg-008', 'sprint-velocity-q1.pdf',        245000,  'application/pdf',  'https://cdn.mesajcell.com/files/sprint-velocity-q1.pdf',  NULL),
('att-002', 'msg-013', 'veri-analiz-raporu.xlsx',        512000,  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'https://cdn.mesajcell.com/files/veri-analiz-raporu.xlsx', NULL),
('att-003', 'msg-033', 'sidebar-design-v2.png',          180000,  'image/png',  'https://cdn.mesajcell.com/files/sidebar-design-v2.png',  'https://cdn.mesajcell.com/thumbs/sidebar-design-v2.png'),
('att-004', 'msg-035', 'kullanici-arastirmasi-2026.pdf', 890000,  'application/pdf',  'https://cdn.mesajcell.com/files/kullanici-arastirmasi-2026.pdf', NULL);

-- -----------------------------------------------------
-- Mention örnekleri
-- -----------------------------------------------------
INSERT INTO `message_mentions` (`id`, `message_id`, `mentioned_user_id`) VALUES
('men-001', 'msg-016', 'usr-00001-admin-00001');

-- -----------------------------------------------------
-- Okunma bilgileri (read receipts)
-- -----------------------------------------------------
INSERT INTO `read_receipts` (`id`, `user_id`, `channel_id`, `last_read_message_id`, `last_read_at`) VALUES
('rr-001', 'usr-00001-admin-00001', 'ch-00001-genel-000001', 'msg-020', '2026-01-10 17:05:00'),
('rr-002', 'usr-00002-user-000002', 'ch-00001-genel-000001', 'msg-018', '2026-01-09 09:30:00'),
('rr-003', 'usr-00003-user-000003', 'ch-00001-genel-000001', 'msg-020', '2026-01-10 17:01:00'),
('rr-004', 'usr-00001-admin-00001', 'ch-00002-backend-0001', 'msg-030', '2026-01-06 16:05:00'),
('rr-005', 'usr-00002-user-000002', 'ch-00003-frontend-001', 'msg-038', '2026-01-06 14:05:00');

-- -----------------------------------------------------
-- OTP kayıtları (simülasyon)
-- -----------------------------------------------------
INSERT INTO `otp_verifications` (`id`, `gsm_number`, `otp_code`, `expires_at`, `verified`) VALUES
('otp-001', '+905301000001', '1234', '2026-01-01 09:15:00', 1),
('otp-002', '+905301000002', '1234', '2026-01-01 09:15:00', 1),
('otp-003', '+905301000003', '1234', '2026-01-01 09:15:00', 1);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
