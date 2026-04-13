-- MIGRATION 004 — EXTENSIONS AVENANT v1.1
-- Transparence + Conformité ARTCI
-- ============================================================

-- Table artci_declarations
CREATE TABLE IF NOT EXISTS artci_declarations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_ref TEXT UNIQUE NOT NULL,
  treatment_name  TEXT NOT NULL,
  purpose         TEXT NOT NULL,
  declared_at     DATE NOT NULL,
  valid_until     DATE,
  document_path   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion déclaration initiale (à compléter avec la vraie référence ARTCI)
INSERT INTO artci_declarations (declaration_ref, treatment_name, purpose, declared_at)
VALUES (
  'ARTCI-2026-[REF_A_OBTENIR]',
  'Collecte et traitement des données financières de prospects bancaires',
  'Génération de recommandations bancaires personnalisées et mise en relation avec les établissements partenaires',
  '2026-04-01'
);

-- ============================================================
-- FIN MIGRATION 004
