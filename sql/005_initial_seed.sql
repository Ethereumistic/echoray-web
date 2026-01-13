-- 005_initial_seed.sql
-- Initial system data for subscription tiers and permissions

-- 1. Seed Subscription Tiers
INSERT INTO subscription_tiers (name, slug, price_eur, is_custom, base_permissions, max_members) VALUES
  ('User', 'user', 0, FALSE, 0, 1), 
  ('Web', 'web', 99, FALSE, 1, 5), 
  ('App', 'app', 299, FALSE, 3, 20), 
  ('CRM', 'crm', 0, TRUE, 7, NULL)
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed System Permissions
INSERT INTO permissions (code, bit_position, name, category, min_tier, is_addon) VALUES
  -- Basic
  ('profile.view', 0, 'View Profile', 'basic', NULL, FALSE),
  ('profile.edit', 1, 'Edit Own Profile', 'basic', NULL, FALSE),
  
  -- Web tier
  ('analytics.view', 2, 'View Analytics', 'analytics', 'web', FALSE),
  ('export.csv', 3, 'Export CSV', 'export', 'web', FALSE),
  ('integrations.basic', 4, 'Basic Integrations', 'integrations', 'web', FALSE),
  
  -- App tier
  ('analytics.advanced', 5, 'Advanced Analytics', 'analytics', 'app', FALSE),
  ('api.access', 6, 'API Access', 'api', 'app', FALSE),
  ('export.pdf', 7, 'Export PDF', 'export', 'app', FALSE),
  ('webhooks.manage', 8, 'Manage Webhooks', 'api', 'app', FALSE),
  
  -- CRM tier
  ('crm.contacts', 9, 'CRM Contacts', 'crm', 'crm', FALSE),
  ('crm.deals', 10, 'CRM Deals', 'crm', 'crm', FALSE),
  ('crm.automation', 11, 'CRM Automation', 'crm', 'crm', FALSE),
  
  -- Admin permissions
  ('org.settings', 12, 'Manage Organization Settings', 'admin', NULL, FALSE),
  ('members.invite', 13, 'Invite Members', 'admin', NULL, FALSE),
  ('members.remove', 14, 'Remove Members', 'admin', NULL, FALSE),
  ('roles.manage', 15, 'Manage Roles', 'admin', NULL, FALSE),
  ('billing.view', 16, 'View Billing', 'billing', NULL, FALSE),
  ('billing.manage', 17, 'Manage Billing', 'billing', NULL, FALSE),
  
  -- Addons
  ('integrations.zapier', 18, 'Zapier Integration', 'integrations', 'web', TRUE),
  ('integrations.slack', 19, 'Slack Integration', 'integrations', 'web', TRUE),
  ('storage.extended', 20, 'Extended Storage (100GB)', 'storage', 'web', TRUE),
  ('support.priority', 21, 'Priority Support', 'support', 'web', TRUE)
ON CONFLICT (code) DO NOTHING;
