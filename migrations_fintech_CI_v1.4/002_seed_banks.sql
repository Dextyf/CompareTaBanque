-- ============================================================
-- MIGRATION 002 — SEED DATA : 7 BANQUES
-- Plateforme SaaS Fintech Bancaire — Côte d'Ivoire
-- Source : documents commerciaux officiels remis aux prospects
--          Collecte : Avril 2026
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : bank_profiles (fiche identité des 7 banques)
-- ============================================================

INSERT INTO bank_profiles (id, code, name, email, phone, website, address,
  is_partner, partner_since, registration_type, reliability_score)
VALUES

  -- 1. NSIA Banque
  ('b1000000-0000-0000-0000-000000000001',
   'NSIA',
   'NSIA Banque',
   'nsiabanque.ci@nsiabanque.com',
   '80 200 800',
   'www.nsiabanque.ci',
   'C-22 rue Goyavier, Avenue Jean Mermoz - Cocody, 01 BP 1274 Abidjan 01',
   TRUE, NOW(), 'outbound', 82),

  -- 2. BNI
  ('b2000000-0000-0000-0000-000000000002',
   'BNI',
   'Banque Nationale d''Investissement',
   '[email_bni_a_confirmer@bni.ci]',
   '[telephone_bni]',
   'www.bni.ci',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 80),

  -- 3. SIB
  ('b3000000-0000-0000-0000-000000000003',
   'SIB',
   'Société Ivoirienne de Banque',
   '[email_sib_a_confirmer@sib.ci]',
   '[telephone_sib]',
   'www.sib.ci',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 83),

  -- 4. Coris Bank
  ('b4000000-0000-0000-0000-000000000004',
   'CORIS',
   'Coris Bank International',
   '[email_coris_a_confirmer@corisbank.com]',
   '[telephone_coris]',
   'www.corisbank.com',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 84),

  -- 5. BDU-CI
  ('b5000000-0000-0000-0000-000000000005',
   'BDU',
   'Banque de l''Habitat de Côte d''Ivoire / BDU-CI',
   '[email_bdu_a_confirmer@bdu.ci]',
   '[telephone_bdu]',
   'www.bdu.ci',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 79),

  -- 6. BICICI
  ('b6000000-0000-0000-0000-000000000006',
   'BICICI',
   'Banque Internationale pour le Commerce et l''Industrie de la Côte d''Ivoire',
   '[email_bicici_a_confirmer@bicici.com]',
   '[telephone_bicici]',
   'www.bicici.com',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 80),

  -- 7. Société Générale CI
  ('b7000000-0000-0000-0000-000000000007',
   'SGCI',
   'Société Générale Côte d''Ivoire',
   '[email_sgci_a_confirmer@societegenerale.ci]',
   '05 86 10 28 27',
   'www.societegenerale.ci',
   'Abidjan, Côte d''Ivoire',
   TRUE, NOW(), 'outbound', 85);

-- NOTE : Les emails et téléphones entre crochets sont à remplacer
-- par les contacts officiels validés avant mise en production.

-- ============================================================
-- ÉTAPE 2 : banking_tariffs — NSIA BANQUE
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  savings_rate, savings_rate_limit, savings_rate_frequency,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- NSIA — Pack Artisan (particuliers / artisans sans registre de commerce)
('b1000000-0000-0000-0000-000000000001',
 'Pack Artisan',
 'NSIA_ARTISAN',
 'pack', 'particulier', NULL,
 3000, FALSE, 0, 0,
 0, 250000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, TRUE, TRUE, TRUE,
 NULL, NULL, NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Comprend : compte chèque, carte Saphir VISA 3 ans, assurance moyens paiement, NSIA Banque Direct, SMS illimités, B2W, transfert Orange Money. Frais de tenue mensuels inclus dans le pack. Émission chèque barré gratuite. Dépôt non exigé mais encouragé.'),

-- NSIA — Compte Épargne
('b1000000-0000-0000-0000-000000000001',
 'Compte Épargne',
 'NSIA_EPARGNE',
 'epargne', 'particulier', NULL,
 0, FALSE, 10000, 0,
 0, NULL,
 FALSE, FALSE, FALSE, FALSE,
 FALSE, FALSE, FALSE, FALSE,
 3.50, 10000000, 'annual',
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial 10 000 FCFA. Carte Quartz : 7 500 FCFA/an (obligatoire). Souscription assurance moyen de paiement obligatoire. Taux 3,5% TTC/an sur les 10 premiers millions. Au-delà de 10M : 0%. Intérêts versés annuellement. Frais annuels tenue de compte : gratuit. Clôture : gratuite. Retrait espèces dans toutes agences NSIA CI. Alimentation par virement ou versement espèces uniquement (remise chèque interdite).'),

-- NSIA — Carte Crystal Grand Public
('b1000000-0000-0000-0000-000000000001',
 'Carte Crystal Grand Public',
 'NSIA_CRYSTAL_GP',
 'carte', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, TRUE, FALSE,
 FALSE, FALSE, FALSE, FALSE,
 NULL, NULL, NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Coût : 6 000 FCFA. Carte pour particuliers. Achats en ligne et paiements TPE. Application My Crystal incluse (biométrie, OTP, planification dépenses). Personnalisation carte : 7 500 FCFA. Rechargement : agence, DAB NSIA, ou app My Crystal.'),

-- NSIA — Carte Crystal Salaire (Entreprises)
('b1000000-0000-0000-0000-000000000001',
 'Carte Crystal Salaire',
 'NSIA_CRYSTAL_SAL',
 'carte', 'entreprise', ARRAY['SA','SARL','EI'],
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 FALSE, FALSE, FALSE, FALSE,
 NULL, NULL, NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Coût : 7 500 FCFA. Pour entreprises : gestion frais professionnels, missions, salaires ponctuels SANS rattachement à un compte bancaire. OTP avancé. Notification instantanée. Transfert carte à carte. Règlement CIE/SODECI.'),

-- NSIA — Compte Pro SARL/Sociétés Civiles
('b1000000-0000-0000-0000-000000000001',
 'Compte Courant Pro — SARL / Sociétés Civiles',
 'NSIA_PRO_SARL',
 'courant', 'entreprise', ARRAY['SARL','SNC','SCS','SCI'],
 0, FALSE, 500000, 150000,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL,
 7, 'suffisante',
 '{"fees_public":false,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial : 500 000 FCFA dont deposit 150 000 FCFA. Documents : statuts certifiés, extrait délibérations AG, déclaration fiscale, quittance CIE/SODECI, photos ID + CNI gérant.'),

-- NSIA — Compte Courant Pro SA
('b1000000-0000-0000-0000-000000000001',
 'Compte Courant Pro — SA',
 'NSIA_PRO_SA',
 'courant', 'entreprise', ARRAY['SA'],
 0, FALSE, 2000000, 150000,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL,
 7, 'suffisante',
 '{"fees_public":false,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial : 2 000 000 FCFA dont deposit 150 000 FCFA. Documents SA : statuts, RCCM, JAL, PV AG Constitutive, PV CA nommant PDG/DG, DFE, quittances, photos ID + CNI signataires.');

-- ============================================================
-- ÉTAPE 3 : banking_tariffs — BNI
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  savings_rate, savings_rate_limit, savings_rate_frequency,
  daily_withdrawal_limit,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- BNI — Pack Salaire 0-200k
('b2000000-0000-0000-0000-000000000002',
 'Pack Salaire 0 – 200 000 FCFA',
 'BNI_SAL_200',
 'pack', 'particulier', NULL,
 4000, FALSE, 0, 0,
 0, 200000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL, NULL,
 200000,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Comprend : carte bancaire, AGIO, SMS, application. Plafond retrait : 200 000 FCFA/jour. Dépôt initial 0 (salarié domicilié).'),

-- BNI — Pack Salaire 200k-700k
('b2000000-0000-0000-0000-000000000002',
 'Pack Salaire 200 001 – 700 000 FCFA',
 'BNI_SAL_700',
 'pack', 'particulier', NULL,
 6600, FALSE, 0, 0,
 200001, 700000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL, NULL,
 500000,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Comprend : carte bancaire, AGIO, SMS, application. Plafond retrait : 500 000 FCFA/jour.'),

-- BNI — Compte Chèque non salarié
('b2000000-0000-0000-0000-000000000002',
 'Compte Chèque Non Salarié',
 'BNI_CHEQUE_NS',
 'cheque', 'particulier', NULL,
 0, FALSE, 50000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL,
 NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Versement initial minimum : 50 000 FCFA. Documents : facture CIE/SODECI < 3 mois, 2 photos, CNI valide, attestation de travail ou bulletin de salaire.'),

-- BNI — Compte Épargne
('b2000000-0000-0000-0000-000000000002',
 'Compte Épargne',
 'BNI_EPARGNE',
 'epargne', 'particulier', NULL,
 0, FALSE, 25000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 3.50, NULL, 'annual',
 NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Versement initial : 25 000 FCFA. Solde minimum : 25 000 FCFA. Taux : 3,5%. Documents : facture CIE/SODECI < 3 mois, 2 photos, CNI, attestation de travail + bulletin salaire.'),

-- BNI — Compte Courant SARL
('b2000000-0000-0000-0000-000000000002',
 'Compte Courant SARL',
 'BNI_SARL',
 'courant', 'entreprise', ARRAY['SARL'],
 9500, FALSE, 1000000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL,
 NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais tenue compte : 9 500 FCFA/mois. Versement initial : 1 000 000 FCFA. Documents SARL : demande ouverture compte, statuts OHADA, IDU, JAL ou avis CEPICI, PV AG, DFE, quittance, plan localisation, fiches KYC/LUC/formulaires BNI, 2 photos signataires, CNI valide, documents comptables.'),

-- BNI — Compte Courant SA
('b2000000-0000-0000-0000-000000000002',
 'Compte Courant SA',
 'BNI_SA',
 'courant', 'entreprise', ARRAY['SA'],
 0, FALSE, 2500000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL,
 NULL,
 7, 'suffisante',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Versement initial : 2 500 000 FCFA. Entreprise Individuelle : 500 000 FCFA. Association/Coopérative/GVC : 100 000 FCFA.');

-- ============================================================
-- ÉTAPE 4 : banking_tariffs — SIB
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  has_overdraft, overdraft_pct_salary,
  savings_rate, savings_rate_limit, savings_rate_frequency,
  weekly_payment_limit,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- SIB — Pack 0-200k (Carte CIEA)
('b3000000-0000-0000-0000-000000000003',
 'Pack Standard 0 – 200 000 FCFA',
 'SIB_PACK_200',
 'pack', 'particulier', NULL,
 4000, FALSE, 15000, 0,
 0, 200000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 FALSE, NULL,
 NULL, NULL, NULL,
 NULL,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Carte CIEA incluse. Versement initial 15 000 FCFA.'),

-- SIB — Pack 200k-400k (Carte Visa Gold)
('b3000000-0000-0000-0000-000000000003',
 'Pack Standard 200 001 – 400 000 FCFA',
 'SIB_PACK_400',
 'pack', 'particulier', NULL,
 6000, FALSE, 15000, 0,
 200001, 400000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 FALSE, NULL,
 NULL, NULL, NULL,
 NULL,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Carte Visa Gold incluse. Versement initial 15 000 FCFA.'),

-- SIB — Pack Club (> 400k recommandé)
('b3000000-0000-0000-0000-000000000003',
 'Pack Club SIB''LÉ',
 'SIB_CLUB',
 'pack', 'particulier', NULL,
 10000, FALSE, 15000, 0,
 400001, NULL,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, TRUE,
 TRUE, 30,
 NULL, NULL, NULL,
 1500000,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '10 000 FCFA/mois. Inclus : compte chèque sans frais tenue, carte Visa plafond 1 500 000 FCFA/semaine, 3D Secure, assurance décès/invalidité (capital 1 500 000 FCFA), découvert optionnel 30% salaire, opposition gratuite 1x/an, remplacement carte gratuit 3 ans, accès SIBNET.'),

-- SIB — Pack TPME
('b3000000-0000-0000-0000-000000000003',
 'Pack TPME',
 'SIB_TPME',
 'pack', 'entreprise', ARRAY['EI','SARL','SUARL','SA'],
 0, FALSE, 300000, 250000,
 0, NULL,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, TRUE, TRUE,
 FALSE, NULL,
 NULL, NULL, NULL,
 NULL,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'CA < 300 millions FCFA. Versement initial 300 000 FCFA (deposit 250 000 FCFA pour EI). Inclus : compte courant, Visa Elite Corporate (GAB national/international, en ligne), SIBNET Entreprise (virements, consultation, chéquiers), assurance multirisques (incendie, dégâts eaux) capital 1 800 000 FCFA. Option : TPE avec remise 50%, assurance SECURICARTE.'),

-- SIB — Épargne
('b3000000-0000-0000-0000-000000000003',
 'Compte Épargne',
 'SIB_EPARGNE',
 'epargne', 'particulier', NULL,
 0, FALSE, 15000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 FALSE, NULL,
 3.50, NULL, 'annual',
 NULL,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Taux 3,5% HT. Versement initial 15 000 FCFA.'),

-- SIB — SARL/SA
('b3000000-0000-0000-0000-000000000003',
 'Compte Courant SARL / SA',
 'SIB_SARL_SA',
 'courant', 'entreprise', ARRAY['SARL','SA','SCI'],
 0, FALSE, 1000000, 500000,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 FALSE, NULL,
 NULL, NULL, NULL,
 NULL,
 8, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Versement initial : 1 000 000 FCFA (deposit 500 000 FCFA). SCI : 300 000 FCFA (deposit 200 000 FCFA). Documents : statuts DNSV, JAL, PV nomination dirigeants, pouvoirs.');

-- ============================================================
-- ÉTAPE 5 : banking_tariffs — CORIS BANK
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  savings_rate, savings_rate_limit, savings_rate_frequency, savings_target,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- Coris — Compte Chèque particuliers
('b4000000-0000-0000-0000-000000000004',
 'Compte Chèque Particuliers',
 'CORIS_CHEQUE_PART',
 'cheque', 'particulier', NULL,
 5000, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 5 000 FCFA HT/mois. Documents : CNI ou attestation identité + récépissé enrôlement, facture CIE/SODECI/Téléphone < 3 mois, 2 photos identité couleur. Pièces complémentaires selon profession.'),

-- Coris — Compte Chèque Virement Salaire
('b4000000-0000-0000-0000-000000000004',
 'Compte Chèque Virement Salaires',
 'CORIS_CHEQUE_SAL',
 'cheque', 'particulier', NULL,
 3500, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 3 500 FCFA HT/mois pour salariés domiciliant leur salaire. Pièces complémentaires : attestation travail ou bulletin salaire ou contrat de travail.'),

-- Coris — Épargne Coris (standard)
('b4000000-0000-0000-0000-000000000004',
 'Épargne Coris',
 'CORIS_EPARGNE_STD',
 'epargne', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 3.50, NULL, 'biannual', NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Taux 3,5% versé 2 fois/an.'),

-- Coris — Épargne Prestige (taux le plus élevé du marché couvert)
('b4000000-0000-0000-0000-000000000004',
 'Épargne Prestige',
 'CORIS_EPARGNE_PRES',
 'epargne', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 5.00, NULL, 'biannual', NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Taux 5% versé 2 fois/an — taux le plus élevé parmi les 7 banques couvertes.'),

-- Coris — Épargne Famille
('b4000000-0000-0000-0000-000000000004',
 'Épargne Famille',
 'CORIS_EPARGNE_FAM',
 'epargne', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 3.50, NULL, 'annual', NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Taux 3,5% versé annuellement. Orientation famille.'),

-- Coris — Épargne Taloklama (Femmes uniquement)
('b4000000-0000-0000-0000-000000000004',
 'Épargne Taloklama',
 'CORIS_TALOKLAMA',
 'epargne', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 3.75, NULL, 'biannual', 'femmes',
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Réservé aux femmes uniquement. Taux 3,75% versé 2 fois/an. Seul produit dédié aux femmes entrepreneurs parmi les 7 banques couvertes.'),

-- Coris — SA
('b4000000-0000-0000-0000-000000000004',
 'Compte Courant SA',
 'CORIS_SA',
 'courant', 'entreprise', ARRAY['SA'],
 15000, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 15 000 FCFA HT/mois. Documents : statuts notariés ou sous seing privé, DNSV/DSV, CNI tous actionnaires > 10%, CNI gérant, 2 photos signataires, lettre fonctionnement, facture CIE/SODECI < 3 mois ou bail, attestation adresse postale.'),

-- Coris — SARL
('b4000000-0000-0000-0000-000000000004',
 'Compte Courant SARL',
 'CORIS_SARL',
 'courant', 'entreprise', ARRAY['SARL'],
 15000, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 15 000 FCFA HT/mois. Mêmes documents que SA.'),

-- Coris — Entreprise Individuelle
('b4000000-0000-0000-0000-000000000004',
 'Compte Courant Entreprise Individuelle',
 'CORIS_EI',
 'courant', 'entreprise', ARRAY['EI'],
 12000, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 12 000 FCFA HT/mois. Documents : RCCM < 3 mois, DFE ou attestation régularité fiscale, CNI exploitant, 2 photos, facture CIE/SODECI ou bail, plan localisation, attestation adresse postale.'),

-- Coris — Associations / Coopératives
('b4000000-0000-0000-0000-000000000004',
 'Compte Courant Associations / Coopératives',
 'CORIS_ASSO',
 'courant', 'entreprise', ARRAY['association','cooperative'],
 15000, TRUE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL, NULL, NULL,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais 15 000 FCFA HT/mois. Documents : récépissé ministère tutelle, statuts, règlement intérieur, PV AG nommant signataires, CNI + photos signataires, lettre fonctionnement, facture, attestation adresse, plan localisation.');

-- ============================================================
-- ÉTAPE 6 : banking_tariffs — BDU-CI
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- BDU — Fonctionnaire (le moins cher du marché couvert)
('b5000000-0000-0000-0000-000000000005',
 'Compte Chèque Fonctionnaire',
 'BDU_FONCT',
 'cheque', 'particulier', NULL,
 1100, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '1 100 FCFA TTC/mois — le tarif le plus bas parmi les 7 banques couvertes. Réservé aux fonctionnaires et corps habillés. Documents : 2 photos, CNI valide, facture CIE/SODECI < 3 mois, attestation de travail ou certificat de présence au corps/prise de service.'),

-- BDU — Salarié Privé / Commerçant
('b5000000-0000-0000-0000-000000000005',
 'Compte Chèque Salarié Privé / Commerçant',
 'BDU_SAL_PRIV',
 'cheque', 'particulier', NULL,
 3300, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '3 300 FCFA TTC/mois. Documents : 2 photos, CNI valide, facture CIE/SODECI < 3 mois, copie dernier bulletin de salaire ou attestation de travail. Pour commerçants : RCCM (P0, P2 ou P2 bis).'),

-- BDU — Entreprises (SARL, SUARL, SA, Prof. libérale, Org. internationales, EI)
('b5000000-0000-0000-0000-000000000005',
 'Compte Entreprise — SARL / SA / EI / Prof. Libérale',
 'BDU_ENTREPRISE',
 'courant', 'entreprise', ARRAY['SARL','SUARL','SA','EI'],
 11000, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 9, 'totale',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":true,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '11 000 FCFA TTC/mois pour SARL, SUARL, SA, EI, professions libérales, organisations internationales, ambassades. Documents SARL/SA : 2 photos, statuts + DNSV, PV nomination gérants, RCCM (M0/M1/M2), liste signataires + documents habilitation, facture SODECI/CIE < 6 mois ou bail légalisé, plan localisation, DFE ou attestation fiscale, CNI signataires, JAL.');

-- ============================================================
-- ÉTAPE 7 : banking_tariffs — BICICI
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  savings_rate, savings_rate_frequency,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- BICICI — Compte Chèque Salarié
('b6000000-0000-0000-0000-000000000006',
 'Compte Chèque Salarié',
 'BICICI_CHEQUE_SAL',
 'cheque', 'particulier', NULL,
 5442, FALSE, 0, 0,
 0, 400000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL,
 5, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":false,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Frais : 5 442 FCFA/mois (carte + SMS + AGIO + application). Documents : 1 photo, CNI ou Passeport, facture CIE/SODECI < 6 mois.'),

-- BICICI — Épargne
('b6000000-0000-0000-0000-000000000006',
 'Compte Épargne',
 'BICICI_EPARGNE',
 'epargne', 'particulier', NULL,
 0, FALSE, 0, 0,
 0, NULL,
 TRUE, TRUE, FALSE, FALSE,
 TRUE, FALSE, FALSE, FALSE,
 3.50, 'annual',
 5, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":false,"special_offers_accessible":false,"deposit_conditions_clear":false}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Taux épargne 3,5% HT. Conditions de dépôt initial non précisées publiquement.'),

-- BICICI — EI (dépôt le plus accessible pour entreprises)
('b6000000-0000-0000-0000-000000000006',
 'Compte Entreprise Individuelle',
 'BICICI_EI',
 'courant', 'entreprise', ARRAY['EI'],
 0, FALSE, 250000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL,
 5, 'partielle',
 '{"fees_public":false,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial : 250 000 FCFA. Documents : demande ouverture compte, RCCM, facture CIE/SODECI entreprise + domicile, DFE, liste personnes habilitées, 2 CNI (CNI+PC ou CNI+PP) signataires, 2 photos.'),

-- BICICI — SARL
('b6000000-0000-0000-0000-000000000006',
 'Compte SARL',
 'BICICI_SARL',
 'courant', 'entreprise', ARRAY['SARL'],
 0, FALSE, 250000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL,
 5, 'partielle',
 '{"fees_public":false,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial : 250 000 FCFA. Documents : lettre demande ouverture signée, statuts, RCCM, JAL, PV AG gérants non statutaires, 2 CNI mandataires+mandants, 2 photos, DFE, bail ou quittance CIE/SODECI société + mandataires, liste signataires.'),

-- BICICI — SA
('b6000000-0000-0000-0000-000000000006',
 'Compte SA',
 'BICICI_SA',
 'courant', 'entreprise', ARRAY['SA'],
 0, FALSE, 250000, 0,
 0, NULL,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, TRUE, FALSE,
 NULL, NULL,
 5, 'partielle',
 '{"fees_public":false,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 'Dépôt initial : 250 000 FCFA — le plus bas du marché pour les SA (vs 2 000 000 FCFA NSIA, 2 500 000 FCFA BNI). Documents : lettre demande signée, statuts, RCCM, DFE, bail/quittance, PV AG constitutive, PV CA nommant organes, procuration mandataires, CNI+photos signataires, dernier bilan si ancienne activité. NOTE : pharmacies et écoles : ajouter autorisation ministère tutelle.');

-- ============================================================
-- ÉTAPE 8 : banking_tariffs — SOCIÉTÉ GÉNÉRALE CI
-- ============================================================

INSERT INTO banking_tariffs (
  bank_id, offer_name, offer_code, account_type, target_profile, company_types,
  monthly_fee, annual_fee, monthly_fee_is_ht, initial_deposit, deposit_amount,
  income_min, income_max,
  has_mobile_banking, has_sms_alerts, has_international, has_visa_card,
  has_online_banking, has_mobile_wallet, has_cheque_book, has_insurance,
  savings_rate, savings_rate_frequency,
  transparency_score, transparency_level,
  transparency_breakdown, transparency_last_checked,
  data_source, data_collected_date,
  notes
)
VALUES

-- SGCI — Pack Horizon (< 150k/mois)
('b7000000-0000-0000-0000-000000000007',
 'Pack Horizon',
 'SGCI_HORIZON',
 'pack', 'particulier', NULL,
 7150, 0, FALSE, 50000, 0,
 0, 150000,
 TRUE, TRUE, FALSE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '7 150 FCFA/mois. Visa Horizon, SGCI Connect, Certicompte (formule 1Mo offert). Versement initial 50 000 FCFA (épargne obligatoire). Documents : 2 photos, CNI valide, facture CIE/SODECI < 6 mois, 3 derniers bulletins de salaire ou contrat de travail mentionnant revenu.'),

-- SGCI — Pack Classic
('b7000000-0000-0000-0000-000000000007',
 'Pack Classic',
 'SGCI_CLASSIC',
 'pack', 'particulier', NULL,
 9545, 0, FALSE, 50000, 0,
 150001, 600000,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '9 545 FCFA/mois. Visa Classic, SGCI Connect, Certicompte (formule 2Mo offert). Versement initial 50 000 FCFA.'),

-- SGCI — Pack Premier
('b7000000-0000-0000-0000-000000000007',
 'Pack Premier',
 'SGCI_PREMIER',
 'pack', 'particulier', NULL,
 11550, 0, FALSE, 50000, 0,
 600001, 3000000,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, TRUE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '11 550 FCFA/mois. Visa Premier + SGCI Connect + Certicompte (formule 3Mo offert). Versement initial 50 000 FCFA.'),

-- SGCI — Pack Infinite
('b7000000-0000-0000-0000-000000000007',
 'Pack Infinite',
 'SGCI_INFINITE',
 'pack', 'particulier', NULL,
 40000, 0, FALSE, 50000, 0,
 3000001, NULL,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, TRUE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":true,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '40 000 FCFA/mois. Visa Infinite + SGCI Connect + Certicompte 3Mo offert. Versement initial 50 000 FCFA.'),

-- SGCI — Visa Platinum (carte seule, revenus 3M-5M)
('b7000000-0000-0000-0000-000000000007',
 'Carte Visa Platinum',
 'SGCI_PLATINUM',
 'carte', 'particulier', NULL,
 0, 175000, FALSE, 50000, 0,
 3000001, 5000000,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '175 000 FCFA/an. Disponible pour revenus mensuels entre 3M et 5M FCFA.'),

-- SGCI — Visa Infinite Carte (revenus > 5M)
('b7000000-0000-0000-0000-000000000007',
 'Carte Visa Infinite Premium',
 'SGCI_INFINITE_CARD',
 'carte', 'particulier', NULL,
 0, 280000, FALSE, 50000, 0,
 5000001, NULL,
 TRUE, TRUE, TRUE, TRUE,
 TRUE, FALSE, FALSE, FALSE,
 NULL, NULL,
 6, 'partielle',
 '{"fees_public":true,"savings_rate_public":false,"eligibility_documented":true,"special_offers_accessible":false,"deposit_conditions_clear":true}',
 '2026-04-01',
 'document_commercial', '2026-04-01',
 '280 000 FCFA/an. Disponible pour revenus mensuels > 5 000 000 FCFA. Versement initial minimum 50 000 FCFA sur compte épargne obligatoire.');

-- ============================================================
-- ÉTAPE 9 : pricing_grid (5 paliers officiels v1.3)
-- ============================================================

INSERT INTO pricing_grid (
  income_bracket, income_min, income_max,
  price_ht, price_ttc, tva_rate,
  price_inbound_ht, price_inbound_ttc,
  is_negotiable, effective_date, notes
)
VALUES
  ('0-250k',     0,       250000,  1500,  1770,  18.00, 1800,  2124,  FALSE, '2026-04-01',
   'Entrée de gamme — volume important attendu. Inférieur à 2,30 EUR.'),
  ('250k-600k',  250001,  600000,  4000,  4720,  18.00, 4500,  5310,  FALSE, '2026-04-01',
   'Classe moyenne — potentiel crédit conso, pack premium. Environ 6 EUR.'),
  ('600k-800k',  600001,  800000,  7500,  8850,  18.00, 8500,  10030, FALSE, '2026-04-01',
   'Profil confortable — épargne, investissement. Environ 11,40 EUR.'),
  ('800k-1200k', 800001,  1200000, 12500, 14750, 18.00, 15000, 17700, FALSE, '2026-04-01',
   'Lead premium — fort potentiel multi-produits. Environ 19 EUR.'),
  ('1200k+',     1200001, NULL,    15000, 17700, 18.00, 18000, 21240, TRUE,  '2026-04-01',
   'Très premium — sur devis pour les très hauts revenus. Min 15 000 FCFA HT, jusqu''à 20 000 FCFA selon profil.');

-- ============================================================
-- ÉTAPE 10 : admin_users (3 administrateurs)
-- ============================================================

INSERT INTO admin_users (full_name, email, phone, whatsapp, role,
  receives_lead_alerts, receives_daily_digest, receives_weekly_report, receives_overdue_alerts)
VALUES
  ('Desire Saki Trazie Bi',
   'Sakidesireluc@gmail.com',
   '+22507090675 02',
   '+22507090675 02',
   'super_admin',
   TRUE, TRUE, TRUE, TRUE),

  ('Ehinon Ebenezer',
   'arriko199@gmail.com',
   '+22507089664 46',
   '+22507089664 46',
   'admin',
   TRUE, TRUE, TRUE, TRUE),

  ('Jean Enock Guikan',
   'Jeanenockguikan@gmail.com',
   '+22505744114 37',
   '+22505744114 37',
   'admin',
   TRUE, TRUE, TRUE, TRUE);

-- ============================================================
-- FIN MIGRATION 002
-- Résumé : 7 banques, 38 offres tarifaires, 5 paliers prix, 3 admins
-- ============================================================
