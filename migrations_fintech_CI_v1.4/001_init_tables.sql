-- ============================================================
-- MIGRATION 001 — TABLES FONDAMENTALES
-- Plateforme SaaS Fintech Bancaire — Côte d'Ivoire
-- Version : 1.4 | Date : Avril 2026
-- Exécuter dans Supabase → SQL Editor
-- ============================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1 : bank_profiles
-- Fiche identité des banques partenaires
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT UNIQUE NOT NULL,        -- 'NSIA','BNI','SIB','CORIS','BDU','BICICI','SGCI'
  name              TEXT NOT NULL,               -- Nom complet de l'établissement
  email             TEXT NOT NULL,               -- Email principal pour réception des leads
  phone             TEXT,
  website           TEXT,
  address           TEXT,

  -- Participation au réseau d'affiliation
  is_partner        BOOLEAN DEFAULT TRUE,
  partner_since     TIMESTAMPTZ,
  registration_type TEXT DEFAULT 'outbound'
                    CHECK (registration_type IN ('outbound', 'inbound')),

  -- Engagement contractuel
  volume_commitment INTEGER DEFAULT 0,           -- Nombre de leads/mois minimum contractualisé
  contract_type     TEXT DEFAULT 'pay_per_lead'
                    CHECK (contract_type IN ('pay_per_lead','monthly_package','annual','custom')),

  -- Score de fiabilité interne (0-100)
  reliability_score INTEGER DEFAULT 80
                    CHECK (reliability_score BETWEEN 0 AND 100),

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2 : banking_tariffs
-- Grilles tarifaires par banque, offre et type de client
-- ============================================================
CREATE TABLE IF NOT EXISTS banking_tariffs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id               UUID NOT NULL REFERENCES bank_profiles(id) ON DELETE CASCADE,

  -- Identification de l'offre
  offer_name            TEXT NOT NULL,            -- 'Pack Artisan', 'Compte Chèque Salarié'...
  offer_code            TEXT,                     -- Code interne court : 'NSIA_ARTISAN'
  account_type          TEXT NOT NULL
                        CHECK (account_type IN (
                          'cheque', 'epargne', 'courant', 'pack', 'carte', 'pro'
                        )),
  target_profile        TEXT NOT NULL
                        CHECK (target_profile IN (
                          'particulier', 'professionnel', 'entreprise', 'mixte'
                        )),
  company_types         TEXT[],                   -- NULL si particulier : ['SARL','SA','EI','SNC','SCI','SUARL']

  -- Frais et dépôts (en FCFA)
  monthly_fee           INTEGER DEFAULT 0,        -- Frais mensuels TTC (ou HT si précisé)
  monthly_fee_is_ht     BOOLEAN DEFAULT FALSE,    -- TRUE si le montant est HT
  annual_fee            INTEGER DEFAULT 0,        -- Frais annuels (carte, etc.)
  initial_deposit       INTEGER DEFAULT 0,        -- Versement initial total
  deposit_amount        INTEGER DEFAULT 0,        -- Dont partie bloquée (deposit)

  -- Revenus éligibles
  income_min            INTEGER DEFAULT 0,        -- Revenu mensuel minimum requis (FCFA)
  income_max            INTEGER,                  -- NULL = pas de plafond

  -- Épargne
  savings_rate          DECIMAL(5,2),             -- Taux d'intérêt annuel (ex: 3.50)
  savings_rate_limit    INTEGER,                  -- Plafond de rémunération (FCFA)
  savings_rate_frequency TEXT DEFAULT 'annual'
                          CHECK (savings_rate_frequency IN ('annual','biannual','quarterly')),
  savings_target        TEXT,                     -- NULL=tous, 'femmes', 'enfants', 'retraites'

  -- Fonctionnalités incluses
  has_mobile_banking    BOOLEAN DEFAULT FALSE,
  has_sms_alerts        BOOLEAN DEFAULT FALSE,
  has_international     BOOLEAN DEFAULT FALSE,
  has_visa_card         BOOLEAN DEFAULT FALSE,
  has_mastercard        BOOLEAN DEFAULT FALSE,
  has_online_banking    BOOLEAN DEFAULT FALSE,
  has_insurance         BOOLEAN DEFAULT FALSE,
  has_cheque_book       BOOLEAN DEFAULT FALSE,
  has_mobile_wallet     BOOLEAN DEFAULT FALSE,    -- Orange Money, Wave, etc.
  has_overdraft         BOOLEAN DEFAULT FALSE,
  has_credit_access     BOOLEAN DEFAULT FALSE,

  -- Plafonds de transaction
  daily_withdrawal_limit   INTEGER,              -- Plafond retrait journalier (FCFA)
  weekly_payment_limit     INTEGER,              -- Plafond paiement hebdomadaire (FCFA)
  overdraft_pct_salary     INTEGER,              -- Découvert en % du salaire (ex: 30)

  -- === TRANSPARENCE INFORMATIONNELLE (avenant v1.1) ===
  transparency_score       INTEGER DEFAULT 5
                           CHECK (transparency_score BETWEEN 0 AND 10),
  transparency_level       TEXT
                           CHECK (transparency_level IN (
                             'totale', 'suffisante', 'partielle', 'insuffisante'
                           )),
  transparency_breakdown   JSONB,
  -- Ex: {"fees_public":true,"savings_rate_public":true,
  --      "eligibility_documented":true,"special_offers_accessible":false,
  --      "deposit_conditions_clear":true}
  transparency_last_checked DATE,
  transparency_note        TEXT,                  -- Note interne (jamais affichée publiquement)

  -- Source des données
  data_source              TEXT,                  -- 'prospectus_agence','site_web','document_commercial'
  data_collected_date      DATE,
  data_source_document     TEXT,                  -- Référence du document archivé

  -- Statut
  is_active             BOOLEAN DEFAULT TRUE,
  notes                 TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 3 : prospects
-- Profils utilisateurs (particuliers et entreprises)
-- ============================================================
CREATE TABLE IF NOT EXISTS prospects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identité
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  full_name           TEXT NOT NULL,

  -- Type de client
  account_type        TEXT
                      CHECK (account_type IN ('particulier','professionnel','entreprise')),

  -- Profil financier
  monthly_income      INTEGER,                    -- Revenus mensuels (FCFA)
  income_bracket      TEXT
                      CHECK (income_bracket IN (
                        '0-250k','250k-600k','600k-800k','800k-1200k','1200k+'
                      )),
  company_type        TEXT
                      CHECK (company_type IN (
                        'EI','SARL','SUARL','SA','SNC','SCS','SCI','association','cooperative',NULL
                      )),

  -- Besoins exprimés
  needs_savings       BOOLEAN DEFAULT FALSE,
  needs_international BOOLEAN DEFAULT FALSE,
  needs_mobile_banking BOOLEAN DEFAULT TRUE,
  needs_credit        BOOLEAN DEFAULT FALSE,
  needs_pro_services  BOOLEAN DEFAULT FALSE,
  needs_insurance     BOOLEAN DEFAULT FALSE,

  -- Consentement (avenant v1.1 et v1.2)
  consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_status      TEXT DEFAULT 'pending'
                      CHECK (consent_status IN ('pending','granted','withdrawn')),
  consent_date        TIMESTAMPTZ,
  consent_ip          TEXT,

  -- Authentification Supabase
  remember_me         BOOLEAN DEFAULT FALSE,
  auth_user_id        UUID,                       -- Référence auth.users(id) — ajoutée après activation auth

  -- Abonnement
  subscription_tier   TEXT DEFAULT 'free'
                      CHECK (subscription_tier IN ('free','premium')),
  subscription_start  TIMESTAMPTZ,
  subscription_end    TIMESTAMPTZ,
  stripe_customer_id  TEXT,

  -- Cycle de vie
  recycle_count       INTEGER DEFAULT 0,          -- Nombre de cycles de recommandation

  -- Méta
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 4 : consent_records
-- Log d'audit des consentements (conformité Loi 2013-450 CI)
-- ============================================================
CREATE TABLE IF NOT EXISTS consent_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id           UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  -- 4 types de consentement distincts
  consent_type          TEXT NOT NULL
                        CHECK (consent_type IN (
                          'data_processing',    -- Case 1 : obligatoire
                          'bank_transmission',  -- Case 2 : obligatoire
                          'marketing',          -- Case 3 : optionnel
                          'ai_history'          -- Case 4 : optionnel (Premium)
                        )),
  given                 BOOLEAN NOT NULL,
  withdrawn_at          TIMESTAMPTZ,             -- Date de retrait si exercé

  -- Preuves techniques (conformité ARTCI)
  ip_address            TEXT NOT NULL,
  user_agent            TEXT,
  session_fingerprint   TEXT,
  consent_text_hash     TEXT NOT NULL,           -- SHA-256 du texte affiché
  consent_text_version  TEXT NOT NULL DEFAULT 'v1.0',

  -- Référentiels légaux
  artci_declaration_ref TEXT,
  legal_basis           TEXT DEFAULT 'Loi n°2013-450 CI + Directive 07/2010/CM/UEMOA',
  retention_period      TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 5 : pricing_grid
-- Source de vérité unique pour les prix des leads (avenant v1.3)
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_grid (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_bracket   TEXT UNIQUE NOT NULL,
  income_min       INTEGER NOT NULL,
  income_max       INTEGER,                      -- NULL pour le dernier palier
  price_ht         INTEGER NOT NULL,             -- Prix HT (FCFA) — outbound
  price_ttc        INTEGER NOT NULL,             -- Prix TTC (HT × 1.18)
  tva_rate         DECIMAL(4,2) DEFAULT 18.00,
  price_inbound_ht INTEGER NOT NULL,             -- Prix inbound HT (banque qui vient)
  price_inbound_ttc INTEGER NOT NULL,            -- Prix inbound TTC
  is_negotiable    BOOLEAN DEFAULT FALSE,        -- TRUE pour palier 5
  effective_date   DATE NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 6 : recommendations
-- Historique des recommandations générées par le moteur de scoring
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id       UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  -- Snapshot du profil au moment du scoring
  profile_snapshot  JSONB NOT NULL,             -- Copie exacte du profil utilisé

  -- Résultats du scoring
  scores            JSONB NOT NULL,
  -- Ex: [{"bank_id":"uuid","bank_name":"BNI","total_score":82.4,
  --        "breakdown":{"frais":22,"depot":12,"taux":13,"features":21,"digital":9,"transparence":9},
  --        "transparency_badge":"totale"}]
  ranked_bank_ids   UUID[],                     -- IDs banques classées score décroissant

  -- Recommandation principale
  top_bank_id       UUID REFERENCES bank_profiles(id),
  top_bank_score    DECIMAL(5,2),

  -- Explication générée par Claude
  ai_explanation    TEXT,

  -- Cycle (1 = premier, 2 = après recyclage, etc.)
  cycle_number      INTEGER DEFAULT 1,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 7 : leads
-- Cycle de vie complet du lead d'affiliation
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id         UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  recommendation_id   UUID REFERENCES recommendations(id),

  -- Statut (version 2 — avenant v1.4)
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending',            -- Créé, en attente N8N
                        'sent_free',          -- Envoyé gratuitement (période 14j)
                        'awaiting_approval',  -- Proposition envoyée, attente banque
                        'approved',           -- Banque a approuvé
                        'rejected',           -- Banque a refusé
                        'expired',            -- 48h sans réponse
                        'escalated',          -- Transmis à banque suivante
                        'completed',          -- Coordonnées transmises — PROTÉGÉ
                        'archived',           -- Toutes banques refusées
                        'recycled',           -- Retour prospect + feedback + nouveau cycle
                        'converted'           -- Prospect a ouvert un compte (confirmé)
                      )),

  -- Banque courante dans le processus
  current_bank_id     UUID REFERENCES bank_profiles(id),
  current_bank_index  INTEGER DEFAULT 0,        -- 0 = meilleure banque du classement

  -- Exclusivité et recyclage (avenant v1.4)
  excluded_bank_ids   UUID[] DEFAULT ARRAY[]::UUID[], -- Banques déjà contactées
  parent_lead_id      UUID REFERENCES leads(id),      -- Lead précédent si recyclage
  recycle_count       INTEGER DEFAULT 0,
  recycle_max         INTEGER DEFAULT 3,              -- Max 3 cycles par prospect

  -- Mode (gratuit ou payant)
  is_free_period      BOOLEAN DEFAULT FALSE,

  -- Timing
  sent_at             TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,              -- sent_at + 48h
  approved_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,

  -- Transaction liée
  transaction_id      UUID,                     -- Référence ajoutée après création transaction

  -- Méta
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 8 : transactions
-- Facturation des leads aux banques
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id          UUID REFERENCES leads(id),
  bank_id          UUID NOT NULL REFERENCES bank_profiles(id),

  -- Numéro de facture unique
  invoice_number   TEXT UNIQUE NOT NULL,        -- Format: INV-2026-04-0001

  -- Montant (avenant v1.3)
  income_bracket   TEXT NOT NULL
                   CHECK (income_bracket IN (
                     '0-250k','250k-600k','600k-800k','800k-1200k','1200k+'
                   )),
  price_ht         INTEGER NOT NULL,            -- Prix HT en FCFA
  tva_rate         DECIMAL(4,2) DEFAULT 18.00,
  tva_amount       INTEGER NOT NULL,            -- Montant TVA
  price_ttc        INTEGER NOT NULL,            -- Prix TTC = HT + TVA
  currency         TEXT DEFAULT 'FCFA',
  is_inbound       BOOLEAN DEFAULT FALSE,       -- TRUE si banque inbound (tarif majoré)
  custom_price     BOOLEAN DEFAULT FALSE,       -- TRUE si prix négocié/devis
  pricing_notes    TEXT,

  -- Statut paiement
  payment_status   TEXT DEFAULT 'pending'
                   CHECK (payment_status IN (
                     'pending','approved','paid','overdue','cancelled'
                   )),

  -- Approbation banque
  approval_email   TEXT,
  approved_by      TEXT,
  approved_at      TIMESTAMPTZ,
  paid_at          TIMESTAMPTZ,

  -- Méta
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 9 : conversation_history
-- Mémoire des conversations IA par prospect (Premium)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id   UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  role          TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content       TEXT NOT NULL,

  session_id    UUID NOT NULL,                 -- Regroupe les messages d'une session
  is_onboarding BOOLEAN DEFAULT FALSE,         -- TRUE si collecte du profil initial
  agent_type    TEXT DEFAULT 'orchestrator'
                CHECK (agent_type IN (
                  'orchestrator','nsia','bni','sib','coris','bdu','bicici','sgci','accounting'
                )),

  token_count   INTEGER,                       -- Pour suivi des coûts API

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 10 : admin_users
-- Administrateurs de la plateforme
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID,                          -- Référence auth.users(id)
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  whatsapp      TEXT,
  role          TEXT DEFAULT 'admin'
                CHECK (role IN ('super_admin','admin','viewer')),

  -- Préférences notifications
  receives_lead_alerts    BOOLEAN DEFAULT TRUE,
  receives_daily_digest   BOOLEAN DEFAULT TRUE,
  receives_weekly_report  BOOLEAN DEFAULT TRUE,
  receives_overdue_alerts BOOLEAN DEFAULT TRUE,

  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 11 : notification_log
-- Journal complet de toutes les notifications envoyées
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_type    TEXT NOT NULL
                    CHECK (recipient_type IN ('bank','admin','prospect')),
  recipient_id      UUID,
  recipient_email   TEXT,
  recipient_phone   TEXT,

  notification_type TEXT NOT NULL,
  -- 'lead_proposal','lead_approved','lead_rejected','lead_completed',
  -- 'overdue_reminder','daily_digest','weekly_report','monthly_report',
  -- 'recycle_notification','system_alert'

  subject           TEXT,
  body_preview      TEXT,                       -- 300 premiers caractères
  channel           TEXT CHECK (channel IN ('email','whatsapp','sms')),

  lead_id           UUID REFERENCES leads(id),
  transaction_id    UUID REFERENCES transactions(id),

  sent              BOOLEAN DEFAULT FALSE,
  sent_at           TIMESTAMPTZ,
  error_message     TEXT,
  retry_count       INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 12 : prospect_feedback
-- Retour d'expérience prospect après contact bancaire (avenant v1.4)
-- ============================================================
CREATE TABLE IF NOT EXISTS prospect_feedback (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id              UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  lead_id                  UUID REFERENCES leads(id),
  bank_id                  UUID REFERENCES bank_profiles(id),

  -- Expérience avec la banque
  was_contacted            BOOLEAN,
  contact_delay            TEXT CHECK (contact_delay IN (
                             'moins_24h','1_3_jours','plus_3_jours','jamais'
                           )),
  experience_rating        INTEGER CHECK (experience_rating BETWEEN 1 AND 5),
  no_subscription_reason   TEXT CHECK (no_subscription_reason IN (
                             'frais_eleves','depot_inaccessible','offre_inadaptee',
                             'conseiller_indisponible','compte_ouvert','autres'
                           )),
  has_opened_account       BOOLEAN DEFAULT FALSE,
  wants_new_recommendation BOOLEAN DEFAULT FALSE,
  comment                  TEXT CHECK (LENGTH(comment) <= 500),

  -- Traitement IA
  ai_analysis              TEXT,               -- Analyse Claude du feedback
  profile_enrichments      JSONB,              -- Mises à jour profil suggérées par IA

  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 13 : accounting_reports
-- Archivage des rapports comptables (avenant v1.4)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounting_reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type       TEXT NOT NULL
                    CHECK (report_type IN ('daily','weekly','monthly','overdue_alert')),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,

  -- KPIs du rapport
  total_leads       INTEGER DEFAULT 0,
  total_approved    INTEGER DEFAULT 0,
  total_rejected    INTEGER DEFAULT 0,
  total_recycled    INTEGER DEFAULT 0,
  total_converted   INTEGER DEFAULT 0,
  revenue_ht        INTEGER DEFAULT 0,
  revenue_ttc       INTEGER DEFAULT 0,
  revenue_collected INTEGER DEFAULT 0,
  overdue_count     INTEGER DEFAULT 0,
  overdue_amount    INTEGER DEFAULT 0,

  -- Contenu complet
  report_data       JSONB,
  ai_summary        TEXT,                       -- Résumé généré par Agent Comptabilité

  -- Envoi
  sent_to_admins    BOOLEAN DEFAULT FALSE,
  sent_at           TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 14 : payment_reminders
-- Suivi des relances pour impayés (avenant v1.4)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id),
  bank_id         UUID NOT NULL REFERENCES bank_profiles(id),

  reminder_number INTEGER NOT NULL,             -- 1, 2, 3...
  reminder_type   TEXT NOT NULL
                  CHECK (reminder_type IN ('friendly','formal','urgent','suspension')),
  days_overdue    INTEGER NOT NULL,
  amount_due      INTEGER NOT NULL,             -- Montant TTC restant dû

  sent_via        TEXT[],                       -- ['email'], ['email','whatsapp']
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 15 : artci_declarations
-- Suivi des déclarations réglementaires (avenant v1.1)
-- ============================================================
CREATE TABLE IF NOT EXISTS artci_declarations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_ref TEXT UNIQUE NOT NULL,         -- Référence ARTCI officielle
  treatment_name  TEXT NOT NULL,
  purpose         TEXT NOT NULL,
  declared_at     DATE NOT NULL,
  valid_until     DATE,
  document_path   TEXT,                         -- Chemin Supabase Storage
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VUE : recyclable_leads
-- Leads pouvant faire l'objet d'un recyclage par le prospect
-- ============================================================
CREATE OR REPLACE VIEW recyclable_leads AS
  SELECT
    l.id,
    l.prospect_id,
    l.status,
    l.recycle_count,
    l.recycle_max,
    l.excluded_bank_ids,
    l.completed_at,
    p.email        AS prospect_email,
    p.full_name    AS prospect_name,
    p.monthly_income,
    p.income_bracket,
    bp.name        AS last_bank_name
  FROM leads l
  JOIN prospects p ON l.prospect_id = p.id
  LEFT JOIN bank_profiles bp ON l.current_bank_id = bp.id
  WHERE l.status IN ('completed','archived')
    AND l.recycle_count < l.recycle_max
    AND NOT EXISTS (
      SELECT 1 FROM prospect_feedback pf
      WHERE pf.lead_id = l.id
        AND pf.wants_new_recommendation = FALSE
    );

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================

-- Prospects
CREATE INDEX IF NOT EXISTS idx_prospects_email       ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_consent     ON prospects(consent_status);
CREATE INDEX IF NOT EXISTS idx_prospects_auth        ON prospects(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_bracket     ON prospects(income_bracket);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_prospect        ON leads(prospect_id);
CREATE INDEX IF NOT EXISTS idx_leads_status          ON leads(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_leads_bank            ON leads(current_bank_id);
CREATE INDEX IF NOT EXISTS idx_leads_excluded        ON leads USING GIN(excluded_bank_ids);
CREATE INDEX IF NOT EXISTS idx_leads_recycled        ON leads(status, recycle_count)
  WHERE status IN ('completed','archived');

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_lead     ON transactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank     ON transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_transactions_overdue  ON transactions(payment_status, approved_at)
  WHERE payment_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_transactions_invoice  ON transactions(invoice_number);

-- Banking tariffs
CREATE INDEX IF NOT EXISTS idx_tariffs_bank          ON banking_tariffs(bank_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tariffs_profile       ON banking_tariffs(target_profile, account_type);
CREATE INDEX IF NOT EXISTS idx_tariffs_transparency  ON banking_tariffs(transparency_score DESC);
CREATE INDEX IF NOT EXISTS idx_tariffs_income        ON banking_tariffs(income_min, income_max);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conv_prospect         ON conversation_history(prospect_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conv_session          ON conversation_history(session_id, created_at);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_prospect     ON prospect_feedback(prospect_id, created_at DESC);

-- Consent
CREATE INDEX IF NOT EXISTS idx_consent_type          ON consent_records(prospect_id, consent_type, given);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1 : Calcul automatique income_bracket
CREATE OR REPLACE FUNCTION fn_get_income_bracket(monthly_income INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF monthly_income IS NULL THEN RETURN NULL; END IF;
  IF    monthly_income <= 250000  THEN RETURN '0-250k';
  ELSIF monthly_income <= 600000  THEN RETURN '250k-600k';
  ELSIF monthly_income <= 800000  THEN RETURN '600k-800k';
  ELSIF monthly_income <= 1200000 THEN RETURN '800k-1200k';
  ELSE                                 RETURN '1200k+';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION fn_update_income_bracket()
RETURNS TRIGGER AS $$
BEGIN
  NEW.income_bracket := fn_get_income_bracket(NEW.monthly_income);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_income_bracket ON prospects;
CREATE TRIGGER trg_income_bracket
  BEFORE INSERT OR UPDATE OF monthly_income ON prospects
  FOR EACH ROW EXECUTE FUNCTION fn_update_income_bracket();

-- Trigger 2 : Mise à jour consent_status après log consent_records
CREATE OR REPLACE FUNCTION fn_update_consent_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM consent_records
    WHERE prospect_id = NEW.prospect_id
      AND consent_type = 'data_processing'
      AND given = TRUE
      AND withdrawn_at IS NULL
  ) AND EXISTS (
    SELECT 1 FROM consent_records
    WHERE prospect_id = NEW.prospect_id
      AND consent_type = 'bank_transmission'
      AND given = TRUE
      AND withdrawn_at IS NULL
  ) THEN
    UPDATE prospects
    SET consent_status = 'granted',
        consent_given  = TRUE,
        consent_date   = NOW(),
        updated_at     = NOW()
    WHERE id = NEW.prospect_id;
  ELSE
    UPDATE prospects
    SET consent_status = 'pending',
        consent_given  = FALSE,
        updated_at     = NOW()
    WHERE id = NEW.prospect_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_consent_status ON consent_records;
CREATE TRIGGER trg_consent_status
  AFTER INSERT OR UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION fn_update_consent_status();

-- Trigger 3 : updated_at automatique
CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prospects_updated ON prospects;
CREATE TRIGGER trg_prospects_updated
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated ON leads;
CREATE TRIGGER trg_leads_updated
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

DROP TRIGGER IF EXISTS trg_transactions_updated ON transactions;
CREATE TRIGGER trg_transactions_updated
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- ============================================================
-- FIN MIGRATION 001
-- ============================================================
