-- MIGRATION 006 — CYCLE DE VIE LEAD v2 + COMPTABILITÉ
-- Avenant v1.4
-- ============================================================

-- 1. Vérification que les nouveaux statuts sont bien en place
-- (déjà définis dans la migration 001 — version initiale complète)
-- Cette migration documente les index additionnels de performance

-- 2. Index supplémentaires pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_feedback_lead       ON prospect_feedback(lead_id);
CREATE INDEX IF NOT EXISTS idx_feedback_bank       ON prospect_feedback(bank_id, experience_rating);
CREATE INDEX IF NOT EXISTS idx_accounting_type     ON accounting_reports(report_type, period_start);
CREATE INDEX IF NOT EXISTS idx_reminders_overdue   ON payment_reminders(transaction_id, reminder_number);
CREATE INDEX IF NOT EXISTS idx_leads_parent        ON leads(parent_lead_id) WHERE parent_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_converted     ON leads(prospect_id) WHERE status = 'converted';

-- 3. Fonction utilitaire : générer un numéro de facture unique
CREATE OR REPLACE FUNCTION fn_generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_year    TEXT;
  v_month   TEXT;
  v_seq     INTEGER;
  v_result  TEXT;
BEGIN
  v_year  := TO_CHAR(NOW(), 'YYYY');
  v_month := TO_CHAR(NOW(), 'MM');

  -- Compte le nombre de factures de ce mois pour la séquence
  SELECT COALESCE(COUNT(*), 0) + 1
    INTO v_seq
    FROM transactions
   WHERE TO_CHAR(created_at, 'YYYY-MM') = v_year || '-' || v_month;

  v_result := 'INV-' || v_year || '-' || v_month || '-' || LPAD(v_seq::TEXT, 4, '0');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 4. Fonction utilitaire : calculer le prix d'un lead
CREATE OR REPLACE FUNCTION fn_calculate_lead_price(
  p_income_bracket TEXT,
  p_is_inbound     BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  price_ht    INTEGER,
  tva_amount  INTEGER,
  price_ttc   INTEGER,
  tva_rate    DECIMAL
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      CASE WHEN p_is_inbound THEN pg.price_inbound_ht ELSE pg.price_ht END,
      CASE WHEN p_is_inbound
        THEN ROUND((pg.price_inbound_ht * pg.tva_rate / 100))::INTEGER
        ELSE ROUND((pg.price_ht * pg.tva_rate / 100))::INTEGER
      END,
      CASE WHEN p_is_inbound THEN pg.price_inbound_ttc ELSE pg.price_ttc END,
      pg.tva_rate
    FROM pricing_grid pg
    WHERE pg.income_bracket = p_income_bracket
      AND pg.is_active = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Fonction utilitaire : vérifier si un lead est recyclable
CREATE OR REPLACE FUNCTION fn_is_lead_recyclable(p_lead_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_feedback_refused BOOLEAN;
BEGIN
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_lead.status NOT IN ('completed','archived') THEN RETURN FALSE; END IF;
  IF v_lead.recycle_count >= v_lead.recycle_max THEN RETURN FALSE; END IF;

  -- Vérifier que le prospect n'a pas refusé un nouveau cycle
  SELECT EXISTS(
    SELECT 1 FROM prospect_feedback
    WHERE lead_id = p_lead_id
      AND wants_new_recommendation = FALSE
  ) INTO v_feedback_refused;

  RETURN NOT v_feedback_refused;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Requête utilitaire pour N8N — Leads expirés à relancer
-- (Utilisée par WF-03 Relance 48h, schedule horaire)
-- SELECT id, prospect_id, current_bank_id, current_bank_index,
--        excluded_bank_ids, recommendation_id
-- FROM leads
-- WHERE status = 'awaiting_approval'
--   AND expires_at < NOW()
-- ORDER BY expires_at ASC;

-- 7. Requête utilitaire pour N8N — Transactions en retard
-- (Utilisée par WF-08 Relance Impayés, schedule quotidien)
-- SELECT t.id, t.bank_id, t.invoice_number, t.price_ttc,
--        t.approved_at,
--        EXTRACT(DAY FROM NOW() - t.approved_at)::INTEGER AS days_overdue,
--        bp.name AS bank_name, bp.email AS bank_email
-- FROM transactions t
-- JOIN bank_profiles bp ON t.bank_id = bp.id
-- WHERE t.payment_status = 'approved'
--   AND t.approved_at < NOW() - INTERVAL '7 days'
--   AND NOT EXISTS (
--     SELECT 1 FROM payment_reminders pr
--     WHERE pr.transaction_id = t.id
--       AND pr.sent_at > NOW() - INTERVAL '6 days'
--   )
-- ORDER BY t.approved_at ASC;

-- ============================================================
-- RÉCAPITULATIF FINAL DES MIGRATIONS
-- ============================================================
-- 001 : 15 tables + 1 vue + triggers + index (schéma complet)
-- 002 : 7 banques (38 offres) + 5 paliers prix + 3 admins
-- 003 : Row Level Security sur toutes les tables sensibles
-- 004 : Table artci_declarations + déclaration initiale
-- 005 : Vérification contraintes pricing
-- 006 : Index additionnels + fonctions utilitaires SQL
-- ============================================================
-- TOTAL : 16 tables, 1 vue, 6 fonctions, 20+ index, 3 triggers
-- ============================================================

-- ============================================================
-- FIN MIGRATION 006
-- ============================================================
