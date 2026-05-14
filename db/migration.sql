-- ============================================================
-- MesajCell Database Migration
-- MySQL 8.x
-- ============================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema
-- -----------------------------------------------------
<<<<<<< HEAD
-- Railway'de "railway" DB kullanılır, schema oluşturulmaz
=======
CREATE SCHEMA IF NOT EXISTS `mesajcell_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mesajcell_db`;
>>>>>>> mobil

-- -----------------------------------------------------
-- 1. organizations  (created_by FK eklenir sonra)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `organizations` (
  `id`         CHAR(36)     NOT NULL,
  `name`       VARCHAR(200) NOT NULL,
  `logo_url`   VARCHAR(500) NULL DEFAULT NULL,
  `domain`     VARCHAR(150) NULL DEFAULT NULL,
  `created_by` CHAR(36)     NULL DEFAULT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_org_domain` (`domain`),
  INDEX `idx_org_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`                CHAR(36)     NOT NULL,
  `org_id`            CHAR(36)     NOT NULL,
  `full_name`         VARCHAR(150) NOT NULL,
  `gsm_number`        VARCHAR(20)  NOT NULL,
  `email`             VARCHAR(150) NULL DEFAULT NULL,
  `password_hash`     VARCHAR(255) NULL DEFAULT NULL,
  `profile_photo_url` VARCHAR(500) NULL DEFAULT NULL,
  `status_message`    VARCHAR(255) NULL DEFAULT NULL,
  `presence_status`   ENUM('ONLINE','OFFLINE','BUSY') NOT NULL DEFAULT 'OFFLINE',
  `role`              ENUM('ORG_ADMIN','EMPLOYEE')     NOT NULL DEFAULT 'EMPLOYEE',
  `otp_verified`      TINYINT(1)   NOT NULL DEFAULT 0,
  `last_seen`         TIMESTAMP    NULL DEFAULT NULL,
  `created_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_user_gsm` (`gsm_number`),
  UNIQUE INDEX `uq_user_email` (`email`),
  INDEX `idx_user_org` (`org_id`),
  INDEX `idx_user_name` (`full_name`),
  CONSTRAINT `fk_users_org`
    FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- organizations.created_by → users FK (circular dependency fix)
ALTER TABLE `organizations`
  ADD CONSTRAINT `fk_org_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL;

-- -----------------------------------------------------
-- 3. channels
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `channels` (
  `id`          CHAR(36)     NOT NULL,
  `org_id`      CHAR(36)     NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `description` TEXT         NULL DEFAULT NULL,
  `icon_url`    VARCHAR(500) NULL DEFAULT NULL,
  `type`        ENUM('PUBLIC','PRIVATE','DM') NOT NULL,
  `created_by`  CHAR(36)     NOT NULL,
  `is_archived` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_channel_org`  (`org_id`),
  INDEX `idx_channel_type` (`type`),
  INDEX `fk_channel_creator` (`created_by`),
  CONSTRAINT `fk_channel_org`
    FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_channel_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 4. channel_members
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `channel_members` (
  `id`                      CHAR(36) NOT NULL,
  `channel_id`              CHAR(36) NOT NULL,
  `user_id`                 CHAR(36) NOT NULL,
  `role`                    ENUM('MEMBER','CHANNEL_ADMIN') NOT NULL DEFAULT 'MEMBER',
  `notification_preference` ENUM('ALL','MENTIONS_ONLY','MUTED') NOT NULL DEFAULT 'ALL',
  `joined_at`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_channel_user` (`channel_id`, `user_id`),
  INDEX `idx_member_user` (`user_id`),
  CONSTRAINT `fk_member_channel`
    FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_member_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 5. messages
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id`                  CHAR(36) NOT NULL,
  `channel_id`          CHAR(36) NOT NULL,
  `sender_id`           CHAR(36) NOT NULL,
  `content`             TEXT     NULL DEFAULT NULL,
  `message_type`        ENUM('TEXT','FILE','IMAGE','SYSTEM') NOT NULL DEFAULT 'TEXT',
  `reply_to_message_id` CHAR(36) NULL DEFAULT NULL,
  `is_edited`           TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted`          TINYINT(1) NOT NULL DEFAULT 0,
  `deleted_at`          TIMESTAMP  NULL DEFAULT NULL,
  `created_at`          TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_message_channel`         (`channel_id`),
  INDEX `idx_message_sender`          (`sender_id`),
  INDEX `idx_message_created`         (`created_at`),
  INDEX `idx_message_channel_created` (`channel_id`, `created_at`),
  INDEX `fk_reply_message`            (`reply_to_message_id`),
  FULLTEXT INDEX `ft_message_content` (`content`),
  CONSTRAINT `fk_message_channel`
    FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reply_message`
    FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 6. message_attachments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_attachments` (
  `id`            CHAR(36)     NOT NULL,
  `message_id`    CHAR(36)     NOT NULL,
  `file_name`     VARCHAR(255) NOT NULL,
  `file_size`     BIGINT       NOT NULL,
  `mime_type`     VARCHAR(100) NULL DEFAULT NULL,
  `file_url`      VARCHAR(500) NULL DEFAULT NULL,
  `thumbnail_url` VARCHAR(500) NULL DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_attachment_message` (`message_id`),
  CONSTRAINT `fk_attachment_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 7. message_mentions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_mentions` (
  `id`                CHAR(36) NOT NULL,
  `message_id`        CHAR(36) NOT NULL,
  `mentioned_user_id` CHAR(36) NOT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_mention_message` (`message_id`),
  INDEX `fk_mention_user`    (`mentioned_user_id`),
  CONSTRAINT `fk_mention_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_mention_user`
    FOREIGN KEY (`mentioned_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 8. message_reactions  (bonus)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_reactions` (
  `id`         CHAR(36)    NOT NULL,
  `message_id` CHAR(36)    NOT NULL,
  `user_id`    CHAR(36)    NOT NULL,
  `emoji`      VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_reaction` (`message_id`, `user_id`, `emoji`),
  INDEX `fk_reaction_user` (`user_id`),
  CONSTRAINT `fk_reaction_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reaction_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 9. message_threads  (bonus)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_threads` (
  `id`                CHAR(36) NOT NULL,
  `parent_message_id` CHAR(36) NOT NULL,
  `message_id`        CHAR(36) NOT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_thread_parent`  (`parent_message_id`),
  INDEX `fk_thread_message` (`message_id`),
  CONSTRAINT `fk_thread_parent`
    FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_thread_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 10. notifications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`           CHAR(36) NOT NULL,
  `user_id`      CHAR(36) NOT NULL,
  `type`         ENUM('MENTION','MESSAGE','CHANNEL_INVITE') NOT NULL,
  `reference_id` CHAR(36) NULL DEFAULT NULL,
  `is_read`      TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notification_user` (`user_id`),
  INDEX `idx_notification_read` (`is_read`),
  CONSTRAINT `fk_notification_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 11. organization_invitations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `organization_invitations` (
  `id`           CHAR(36)     NOT NULL,
  `org_id`       CHAR(36)     NOT NULL,
  `invited_by`   CHAR(36)     NOT NULL,
  `email`        VARCHAR(150) NULL DEFAULT NULL,
  `gsm_number`   VARCHAR(20)  NULL DEFAULT NULL,
  `invite_token` VARCHAR(255) NOT NULL,
  `status`       ENUM('PENDING','ACCEPTED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `expires_at`   TIMESTAMP    NOT NULL,
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_invite_token` (`invite_token`),
  INDEX `fk_invitation_org`  (`org_id`),
  INDEX `fk_invitation_user` (`invited_by`),
  CONSTRAINT `fk_invitation_org`
    FOREIGN KEY (`org_id`) REFERENCES `organizations` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_invitation_user`
    FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 12. otp_verifications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id`         CHAR(36)    NOT NULL,
  `gsm_number` VARCHAR(20) NOT NULL,
  `otp_code`   VARCHAR(10) NOT NULL,
  `expires_at` TIMESTAMP   NOT NULL,
  `verified`   TINYINT(1)  NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otp_gsm` (`gsm_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 13. pinned_messages  (bonus)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pinned_messages` (
  `id`         CHAR(36) NOT NULL,
  `channel_id` CHAR(36) NOT NULL,
  `message_id` CHAR(36) NOT NULL,
  `pinned_by`  CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_pin_channel` (`channel_id`),
  INDEX `fk_pin_message` (`message_id`),
  INDEX `fk_pin_user`    (`pinned_by`),
  CONSTRAINT `fk_pin_channel`
    FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_pin_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_pin_user`
    FOREIGN KEY (`pinned_by`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 14. read_receipts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `read_receipts` (
  `id`                   CHAR(36) NOT NULL,
  `user_id`              CHAR(36) NOT NULL,
  `channel_id`           CHAR(36) NOT NULL,
  `last_read_message_id` CHAR(36) NULL DEFAULT NULL,
  `last_read_at`         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_read_user_channel` (`user_id`, `channel_id`),
  INDEX `fk_read_channel`      (`channel_id`),
  INDEX `fk_last_read_message` (`last_read_message_id`),
  CONSTRAINT `fk_read_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_read_channel`
    FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_last_read_message`
    FOREIGN KEY (`last_read_message_id`) REFERENCES `messages` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 15. user_sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id`            CHAR(36)     NOT NULL,
  `user_id`       CHAR(36)     NOT NULL,
  `refresh_token` VARCHAR(500) NOT NULL,
  `ip_address`    VARCHAR(100) NULL DEFAULT NULL,
  `user_agent`    TEXT         NULL DEFAULT NULL,
  `expires_at`    TIMESTAMP    NOT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_session_user` (`user_id`),
  CONSTRAINT `fk_session_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
