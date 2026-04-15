/* ── Types ──────────────────────────────────────────────────── */

export interface BankTariff {
  target_profile?: string;
  monthly_fee?: number;
  fees?: number;
  credit_rate?: number;
  taux?: number;
  has_visa_card?: boolean;
  has_international?: boolean;
  has_online_banking?: boolean;
  has_mobile_banking?: boolean;
  has_insurance?: boolean;
}

export interface Bank {
  id: string;
  code: string;
  name: string;
  logo?: string;
  taux_base_credit?: number;
  reliability_score?: number;
  score_partenariats?: number;
  score_autonomie_base?: number;
  banking_tariffs?: BankTariff[];
  [key: string]: unknown;
}

export interface Profile {
  full_name?: string;
  email?: string;
  phone?: string;
  age?: string | number;
  company_type?: string;
  type_pme?: string;
  statut?: string;
  legal_type?: string;
  needs_credit?: string;
  type_credit?: string;
  secteur_activite?: string;
  niveau_structuration?: number | string;
  garantie_disponible?: number | string;
  besoin_autonomie?: number | string;
  monthly_income?: number | string;
  chiffre_affaires?: number | string;
  montant_demande?: number | string;
  apport_personnel_pct?: number | string;
  partenariat_sgpme?: boolean;
  partenariat_ifc?: boolean;
  interests?: {
    savings?: boolean;
    visa_premium?: boolean;
    low_fees?: boolean;
    mortgage?: boolean;
    business_credit?: boolean;
  };
}

export interface BankOffer {
  id: string;
  code: string;
  name: string;
  logo?: string;
  tariff: BankTariff;
  reliability: number;
  baseRate: number;
  monthlyFee: number;
  hasVisa: boolean;
  hasInternationalVisa: boolean;
  hasOnline: boolean;
  hasMobile: boolean;
  hasInsurance: boolean;
  scorePartenariats: number;
  scoreAutonomieBase: number;
  fees_detail: string;
  visa_detail: string;
  pros: string[];
}

export interface ScoredBank extends Bank, BankOffer {
  score: number;
  scoreBreakdown: { access: number; cost: number; service: number; trust: number };
  taux_estime: string;
  probabilite: string;
  garantie_requise: string;
  dependance_conseiller: string;
  comment: string;
}

/* ── Constantes ─────────────────────────────────────────────── */

const TARGET_PROFILE_MAP: Record<string, string> = {
  individual: 'particulier',
  PME:        'entreprise',
  entreprise: 'entreprise',
};

const SCORE_WEIGHTS = { access: 30, cost: 30, service: 20, trust: 20 };

/* ── Helpers ────────────────────────────────────────────────── */

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ── Fonctions publiques ────────────────────────────────────── */

export function getTargetProfile(profile: Profile): string {
  return (
    TARGET_PROFILE_MAP[profile.company_type ?? ''] ??
    TARGET_PROFILE_MAP[profile.type_pme ?? ''] ??
    'particulier'
  );
}

export function selectTariff(bank: Bank, targetProfile: string): BankTariff {
  const tariffs: BankTariff[] = bank.banking_tariffs ?? [];
  const matching = tariffs.filter(
    t => t.target_profile === targetProfile || t.target_profile === 'mixte'
  );
  return matching[0] ?? tariffs[0] ?? {};
}

export function buildBankOffer(bank: Bank, profile: Profile): BankOffer {
  const target   = getTargetProfile(profile);
  const tariff   = selectTariff(bank, target);
  const monthlyFee = toNum(tariff.monthly_fee ?? tariff.fees, 0);
  const baseRate   = toNum(tariff.credit_rate ?? tariff.taux ?? bank.taux_base_credit, 9.5);
  const reliability = clamp(toNum(bank.reliability_score, 0), 0, 100);

  const hasVisa              = !!tariff.has_visa_card;
  const hasInternationalVisa = hasVisa && !!tariff.has_international;
  const hasOnline            = !!tariff.has_online_banking;
  const hasMobile            = !!tariff.has_mobile_banking;
  const hasInsurance         = !!tariff.has_insurance;

  const pros: string[] = [];
  if (hasMobile)    pros.push('App Mobile incluse');
  if (hasVisa)      pros.push('Carte VISA activée');
  if (hasOnline)    pros.push('Accès web 24/7');
  if (hasInsurance) pros.push('Assurance optionnelle');
  if (pros.length < 3) pros.push('Service Client 5 étoiles');

  return {
    id: bank.id, code: bank.code, name: bank.name, logo: bank.logo,
    tariff, reliability, baseRate, monthlyFee,
    hasVisa, hasInternationalVisa, hasOnline, hasMobile, hasInsurance,
    scorePartenariats: toNum(bank.score_partenariats, 0),
    scoreAutonomieBase: toNum(bank.score_autonomie_base, 0),
    fees_detail: monthlyFee > 0 ? `Pack: ${monthlyFee}F/mois` : 'Compte Gratuit',
    visa_detail: hasVisa ? (hasInternationalVisa ? 'VISA Internationale' : 'VISA Classic') : 'Standard',
    pros: pros.slice(0, 3),
  };
}

/* ── Sous-scores ────────────────────────────────────────────── */

function scoreAccess(offer: BankOffer, profile: Profile): number {
  const structuration = clamp(toNum(profile.niveau_structuration, 3), 0, 5);
  const isCredit      = profile.needs_credit !== 'no';
  const creditType    = profile.type_credit ?? 'consommation';
  const isIndependent = profile.statut === 'indépendant';

  if (isCredit) {
    const base = clamp(Math.round((offer.reliability / 100) * 18), 0, 18);
    const profileBonus =
      profile.company_type === 'PME'          ? 5 :
      profile.statut === 'fonctionnaire'       ? 4 :
      isIndependent                            ? 3 : 2;
    const structureBonus = structuration >= 4 ? 4 : structuration >= 2 ? 2 : 0;
    const partnerBonus   = profile.partenariat_sgpme ? 3 : 0;
    const creditTypeBonus =
      creditType === 'immobilier'    ? 1 :
      creditType === 'investissement' ? 2 : 0;
    return clamp(base + profileBonus + structureBonus + partnerBonus + creditTypeBonus, 0, SCORE_WEIGHTS.access);
  }

  const digital      = (offer.hasOnline ? 8 : 4) + (offer.hasMobile ? 8 : 4);
  const visaBonus    = offer.hasVisa ? 6 : 2;
  const assurBonus   = offer.hasInsurance ? 4 : 0;
  const feesPromo    = profile.interests?.low_fees && offer.monthlyFee <= 1500 ? 2 : 0;
  return clamp(digital + visaBonus + assurBonus + feesPromo, 0, SCORE_WEIGHTS.access);
}

function scoreCost(offer: BankOffer, profile: Profile): number {
  const isCredit = profile.needs_credit !== 'no';
  if (isCredit) {
    let rate = offer.baseRate;
    if (profile.partenariat_sgpme) rate -= 2.0;
    if (profile.partenariat_ifc)   rate -= 1.0;
    if (profile.company_type === 'PME') rate -= 0.5;
    rate = Math.max(rate, 4.5);
    if (rate <= 7)  return 30;
    if (rate <= 9)  return 22;
    if (rate <= 11) return 14;
    return 8;
  }
  const fee = offer.monthlyFee;
  if (fee === 0)    return 30;
  if (fee <= 1500)  return 24;
  if (fee <= 3000)  return 16;
  return 8;
}

function scoreService(offer: BankOffer, profile: Profile): number {
  let score = 0;
  score += offer.hasOnline  ? 6 : 2;
  score += offer.hasMobile  ? 6 : 2;
  score += offer.hasVisa    ? 5 : 1;
  score += offer.hasInsurance ? 3 : 0;
  if (profile.interests?.visa_premium   && offer.hasInternationalVisa) score += 3;
  if (profile.interests?.low_fees       && offer.monthlyFee <= 1500)    score += 2;
  if (profile.interests?.savings        && offer.monthlyFee === 0)      score += 2;
  if (profile.interests?.business_credit && offer.hasMobile && offer.hasOnline) score += 1;
  if (profile.interests?.mortgage       && offer.hasVisa)               score += 1;
  return clamp(score, 0, SCORE_WEIGHTS.service);
}

function scoreTrust(offer: BankOffer): number {
  const baseTrust  = clamp(Math.round((offer.reliability / 100) * 12), 0, 12);
  const partner    = clamp(offer.scorePartenariats, 0, 6);
  const autonomie  = offer.scoreAutonomieBase >= 12 ? 3 : offer.scoreAutonomieBase >= 10 ? 2 : 1;
  const stability  = offer.reliability >= 85 ? 2 : offer.reliability >= 70 ? 1 : 0;
  return clamp(baseTrust + partner + autonomie + stability, 0, SCORE_WEIGHTS.trust);
}

function getProbability(score: number, needsCredit: boolean): string {
  if (needsCredit) {
    if (score >= 82) return 'Optimale';
    if (score >= 68) return 'Élevée';
    return 'À renforcer';
  }
  if (score >= 84) return 'Idéal';
  if (score >= 70) return 'Très bon';
  return 'À vérifier';
}

function getComment(score: number, needsCredit: boolean): string {
  if (needsCredit) {
    if (score >= 85) return 'Match Crédit Premium. Votre dossier est très bien orienté.';
    if (score >= 70) return 'Match Crédit Standard. Accord probable sans surcharge majeure.';
    return 'Match Crédit fragile. Renforcez votre dossier pour plus de confort.';
  }
  if (score >= 85) return 'Pack Services Idéal. Excellente maîtrise des frais et du service.';
  if (score >= 70) return 'Services Bancaires équilibrés. Bon compromis coût/usage.';
  return 'Priorité frais. Étudiez une offre plus compétitive.';
}

/* ── Export principal ───────────────────────────────────────── */

export function scoreBanks(banks: Bank[], profile: Profile): ScoredBank[] {
  const needsCredit = profile.needs_credit !== 'no';
  return banks.map(bank => {
    const offer   = buildBankOffer(bank, profile);
    const access  = scoreAccess(offer, profile);
    const cost    = scoreCost(offer, profile);
    const service = scoreService(offer, profile);
    const trust   = scoreTrust(offer);
    const score   = clamp(Math.round(access + cost + service + trust), 0, 100);
    const taux    = needsCredit ? offer.baseRate : offer.monthlyFee;

    return {
      ...bank,
      ...offer,
      score,
      scoreBreakdown:       { access, cost, service, trust },
      taux_estime:          needsCredit ? `${taux.toFixed(1)}%` : `${offer.monthlyFee} F/mois`,
      probabilite:          getProbability(score, needsCredit),
      garantie_requise:     needsCredit ? 'Sur dossier' : 'Non requise',
      dependance_conseiller: offer.scoreAutonomieBase >= 11 ? 'Faible' : 'Moyenne',
      comment:              getComment(score, needsCredit),
    };
  });
}
