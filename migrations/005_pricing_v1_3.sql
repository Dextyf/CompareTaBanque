-- MIGRATION 005 — EXTENSIONS AVENANT v1.3
-- Pricing + Trigger income_bracket
-- ============================================================

-- Trigger income_bracket déjà défini en migration 001.
-- Cette migration confirme la table pricing_grid déjà créée en 001
-- et seedée en 002. Aucune action supplémentaire requise.

-- Vérification : s'assurer que la contrainte income_bracket est bien en place
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'transactions'
      AND constraint_name = 'transactions_income_bracket_check'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_income_bracket_check
      CHECK (income_bracket IN ('0-250k','250k-600k','600k-800k','800k-1200k','1200k+'));
  END IF;
END $$;

-- ============================================================
-- FIN MIGRATION 005
