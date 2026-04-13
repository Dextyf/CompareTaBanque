-- MIGRATION 004 — EXTENSIONS AVENANT v1.1
-- Transparence + Conformité ARTCI
-- ============================================================
-- NOTE : La table artci_declarations est déjà créée dans la migration 001
-- (TABLE 15). Cette migration se limite à l'insertion de la déclaration
-- initiale ARTCI. Aucune création de table ici.
-- ============================================================

-- Insertion déclaration initiale
-- ⚠️  Remplacer 'ARTCI-2026-[REF_A_OBTENIR]' par la vraie référence
--     obtenue auprès de l'ARTCI avant la mise en production.
INSERT INTO artci_declarations (declaration_ref, treatment_name, purpose, declared_at)
VALUES (
  'ARTCI-2026-[REF_A_OBTENIR]',
  'Collecte et traitement des données financières de prospects bancaires',
  'Génération de recommandations bancaires personnalisées et mise en relation avec les établissements partenaires',
  '2026-04-01'
)
ON CONFLICT (declaration_ref) DO NOTHING;

-- ============================================================
-- FIN MIGRATION 004
