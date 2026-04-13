-- ============================================================
-- MIGRATION 003 — ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activation RLS
ALTER TABLE prospects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_feedback  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_tariffs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_grid       ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users        ENABLE ROW LEVEL SECURITY;

-- ── Données publiques (lecture anonyme autorisée) ──────────────

-- banking_tariffs : lecture publique (données commerciales publiques)
CREATE POLICY tariffs_public_read ON banking_tariffs
  FOR SELECT USING (is_active = TRUE);

-- bank_profiles : lecture publique des partenaires actifs
CREATE POLICY bank_profiles_public_read ON bank_profiles
  FOR SELECT USING (is_partner = TRUE);

-- pricing_grid : lecture publique
CREATE POLICY pricing_grid_public_read ON pricing_grid
  FOR SELECT USING (is_active = TRUE);

-- ── Prospects : accès à leurs propres données uniquement ──────

CREATE POLICY prospect_select ON prospects
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY prospect_update ON prospects
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY prospect_insert ON prospects
  FOR INSERT WITH CHECK (TRUE); -- Inscription libre

-- ── Consentements ──────────────────────────────────────────────

CREATE POLICY consent_select ON consent_records
  FOR SELECT USING (
    prospect_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY consent_insert ON consent_records
  FOR INSERT WITH CHECK (
    prospect_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY consent_update ON consent_records
  FOR UPDATE USING (
    prospect_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
  );

-- ── Conversations IA (Premium) ─────────────────────────────────

CREATE POLICY conv_prospect_access ON conversation_history
  FOR ALL USING (
    prospect_id IN (
      SELECT id FROM prospects
      WHERE auth_user_id = auth.uid()
        AND consent_status = 'granted'
        AND subscription_tier = 'premium'
    )
  );

-- ── Recommandations ────────────────────────────────────────────

CREATE POLICY reco_prospect_access ON recommendations
  FOR SELECT USING (
    prospect_id IN (
      SELECT id FROM prospects
      WHERE auth_user_id = auth.uid()
        AND consent_status = 'granted'
    )
  );

-- ── Leads : prospect voit les siens, admins voient tout ────────

CREATE POLICY leads_access ON leads
  FOR ALL USING (
    -- Le prospect concerné
    prospect_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
    OR
    -- Les admins (via N8N avec service_role — bypasse RLS)
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users WHERE auth_user_id IS NOT NULL
    )
  );

-- ── Transactions : admins uniquement ──────────────────────────

CREATE POLICY transactions_admin_only ON transactions
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users WHERE auth_user_id IS NOT NULL
    )
  );

-- ── Feedback : prospect voit son propre feedback ───────────────

CREATE POLICY feedback_prospect ON prospect_feedback
  FOR ALL USING (
    prospect_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
  );

-- ── Admin users : lecture propre profil ───────────────────────

CREATE POLICY admin_self_read ON admin_users
  FOR SELECT USING (auth_user_id = auth.uid());

-- ── Rapports et relances : admins uniquement ──────────────────

CREATE POLICY accounting_admin_only ON accounting_reports
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users WHERE auth_user_id IS NOT NULL
    )
  );

CREATE POLICY reminders_admin_only ON payment_reminders
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users WHERE auth_user_id IS NOT NULL
    )
  );

CREATE POLICY notif_admin_only ON notification_log
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users WHERE auth_user_id IS NOT NULL
    )
    OR
    recipient_id IN (
      SELECT id FROM prospects WHERE auth_user_id = auth.uid()
    )
  );

-- NOTE : N8N utilise la SERVICE_ROLE_KEY qui bypasse RLS.
-- Ne jamais exposer cette clé côté frontend.

-- ============================================================
-- FIN MIGRATION 003
-- ============================================================
