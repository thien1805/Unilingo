-- Manual migration for notification preferences, inbox, and admin campaigns.
-- Run this before deploying the updated backend to an existing PostgreSQL DB.

ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS event_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS blog_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS forecast_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tips_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS news_notifications BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  audience VARCHAR(50) NOT NULL DEFAULT 'all',
  data JSONB,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_notification_campaigns_notification_type
  ON notification_campaigns(notification_type);
CREATE INDEX IF NOT EXISTS ix_notification_campaigns_category
  ON notification_campaigns(category);

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES notification_campaigns(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_user_notifications_user_id
  ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS ix_user_notifications_campaign_id
  ON user_notifications(campaign_id);
CREATE INDEX IF NOT EXISTS ix_user_notifications_notification_type
  ON user_notifications(notification_type);
CREATE INDEX IF NOT EXISTS ix_user_notifications_category
  ON user_notifications(category);
CREATE INDEX IF NOT EXISTS ix_user_notifications_is_read
  ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS ix_user_notifications_created_at
  ON user_notifications(created_at);
