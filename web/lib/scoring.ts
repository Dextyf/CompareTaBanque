/* ── Types ──────────────────────────────────────────────────── */

export interface BankTariff {
  target_profile?: string;
  account_type?: string;        // cheque | pack | courant | pro | epargne | carte
  offer_code?: string;
  offer_name?: string;
  monthly_fee?: number;
  fees?: number;
  credit_rate?: number;
  taux?: number;
  savings_rate?: number;        // taux d'épargne réel (ex: 3.5, 4.5...)
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
  // Type principal
  company_type?: string;
  type_pme?: string;
  // Particulier
  statut?: string;
  corps_fonction?: string;
  anciennete_emploi?: string;
  secteur_salarie?: string;
  // Entreprise
  legal_type?: string;
  taille_entreprise?: string;
  anciennete_entreprise?: string;
  // Finances
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
  // Partenariats
  partenariat_sgpme?: boolean;
  partenariat_ifc?: boolean;
  // Intérêts
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
  savingsRate: number;          // taux d'épargne réel de la banque
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

/* ── Affinité secteur-banque ─────────────────────────────────── */
const BANK_SECTOR_AFFINITY: Record<string, string[]> = {
  BRIDGE:  ['Finance / Assurance', 'Informatique / Numérique', 'Services / Conseil'],
  SGCI:    ['BTP / Immobilier', 'Industrie / Manufacture', 'Transport / Logistique'],
  NSIA:    ['Santé / Pharmacie', 'Services / Conseil', 'Finance / Assurance'],
  BNI:     ['Éducation / Formation', 'Agriculture / Élevage', 'Services / Conseil'],
  CORIS:   ['Agriculture / Élevage', 'Commerce / Distribution', 'Tourisme / Hôtellerie'],
  BICICI:  ['BTP / Immobilier', 'Industrie / Manufacture', 'Finance / Assurance'],
  SIB:     ['Commerce / Distribution', 'Services / Conseil', 'Tourisme / Hôtellerie'],
  BDU:     ['BTP / Immobilier', 'Commerce / Distribution', 'Agriculture / Élevage'],
};

/* ── Affinité corps de fonction-banque ───────────────────────── */
const BANK_CORPS_AFFINITY: Record<string, string[]> = {
  BNI:   ['education', 'administration', 'justice'],
  SGCI:  ['armee', 'police', 'douane_impot'],
  CORIS: ['education', 'sante'],
  SIB:   ['administration', 'sante'],
};

/* ── Spécialisation crédit par type ──────────────────────────── */
const CREDIT_TYPE_BANK_BOOST: Record<string, string[]> = {
  tresorerie:    ['BRIDGE', 'SGCI', 'BICICI'],
  auto:          ['NSIA', 'BICICI', 'SIB'],
  immobilier:    ['SGCI', 'BNI', 'BICICI', 'SIB'],
  investissement: ['BRIDGE', 'SGCI', 'CORIS'],
  consommation:  ['SIB', 'BNI', 'BDU'],
};

/* ── Helpers ────────────────────────────────────────────────── */

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function getSeniorityBonus(anciennete?: string): number {
  switch (anciennete) {
    case '<1':   return 0;
    case '1-3':  return 1;
    case '3-7':  return 2;
    case '7-15': return 3;
    case '15+':  return 4;
    case '7+':   return 3;
    default:     return 1;
  }
}

function getTailleScore(taille?: string): number {
  switch (taille) {
    case '1-5':    return 0;
    case '6-10':   return 1;
    case '11-50':  return 2;
    case '51-200': return 3;
    case '200+':   return 4;
    default:       return 1;
  }
}

/* ── Fonctions publiques ────────────────────────────────────── */

export function getTargetProfile(profile: Profile): string {
  return (
    TARGET_PROFILE_MAP[profile.company_type ?? ''] ??
    TARGET_PROFILE_MAP[profile.type_pme ?? ''] ??
    'particulier'
  );
}

/**
 * Sélectionne le tarif le plus pertinent pour un profil donné.
 *
 * Règles de priorité :
 *  - Exclut les comptes épargne/carte comme compte principal
 *    (sauf si c'est la seule option)
 *  - Entreprise  : courant > pro > pack
 *  - Particulier : pack > cheque > courant
 *  - Fonctionnaire : cheque dédié en priorité
 *  - PME : essaie de matcher le type juridique (SARL, SA…)
 */
export function selectTariff(bank: Bank, targetProfile: string, profile?: Profile): BankTariff {
  const tariffs: BankTariff[] = bank.banking_tariffs ?? [];

  // Garde les tarifs qui correspondent au profil (ou mixte)
  const matching = tariffs.filter(
    t => t.target_profile === targetProfile || t.target_profile === 'mixte'
  );

  if (matching.length === 0) return tariffs[0] ?? {};
  if (matching.length === 1) return matching[0];

  // Exclure épargne/carte pour le compte principal
  const mainAccounts = matching.filter(
    t => !['epargne', 'carte'].includes(t.account_type ?? '')
  );
  const pool = mainAccounts.length > 0 ? mainAccounts : matching;

  const isPME = targetProfile === 'entreprise';

  if (isPME) {
    // Essayer de matcher le type juridique déclaré
    const legalType = profile?.legal_type?.toUpperCase() ?? '';
    if (legalType) {
      const legalMatch = pool.find(t =>
        t.offer_code?.toUpperCase().includes(legalType) ||
        t.offer_name?.toUpperCase().includes(legalType)
      );
      if (legalMatch) return legalMatch;
    }

    // Priorité par type de compte entreprise
    for (const type of ['courant', 'pro', 'pack']) {
      const found = pool.find(t => t.account_type === type);
      if (found) return found;
    }
    return pool[0];
  }

  // Particulier : fonctionnaires → cheque dédié
  if (profile?.statut === 'fonctionnaire') {
    const cheque = pool.find(t => t.account_type === 'cheque');
    if (cheque) return cheque;
  }

  // Particulier : pack > cheque > courant
  for (const type of ['pack', 'cheque', 'courant']) {
    const found = pool.find(t => t.account_type === type);
    if (found) return found;
  }
  return pool[0];
}

export function buildBankOffer(bank: Bank, profile: Profile): BankOffer {
  const target      = getTargetProfile(profile);
  const tariff      = selectTariff(bank, target, profile);   // ← profil passé
  const monthlyFee  = toNum(tariff.monthly_fee ?? tariff.fees, 0);
  const baseRate    = toNum(tariff.credit_rate ?? tariff.taux ?? bank.taux_base_credit, 9.5);
  const savingsRate = toNum(tariff.savings_rate, 0);
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

  const feesLabel = monthlyFee > 0
    ? `Pack: ${monthlyFee.toLocaleString('fr-FR')} F/mois`
    : 'Compte Gratuit';

  return {
    id: bank.id, code: bank.code, name: bank.name, logo: bank.logo,
    tariff, reliability, baseRate, monthlyFee, savingsRate,
    hasVisa, hasInternationalVisa, hasOnline, hasMobile, hasInsurance,
    scorePartenariats:  toNum(bank.score_partenariats, 0),
    scoreAutonomieBase: toNum(bank.score_autonomie_base, 0),
    fees_detail: feesLabel,
    visa_detail: hasVisa ? (hasInternationalVisa ? 'VISA Internationale' : 'VISA Classic') : 'Standard',
    pros: pros.slice(0, 3),
  };
}

/* ── Sous-scores ────────────────────────────────────────────── */

function scoreAccess(offer: BankOffer, profile: Profile): number {
  const structuration = clamp(toNum(profile.niveau_structuration, 3), 0, 5);
  const isCredit      = profile.needs_credit !== 'no';
  const creditType    = profile.type_credit ?? 'consommation';
  const statut        = profile.statut ?? '';

  if (isCredit) {
    const base = clamp(Math.round((offer.reliability / 100) * 18), 0, 18);

    const profileBonus = (() => {
      if (profile.company_type === 'PME') return 5;
      switch (statut) {
        case 'fonctionnaire':      return 5;
        case 'retraité':           return 4;
        case 'salarié_privé':      return 3;
        case 'profession_libérale':
          return structuration >= 4 ? 4 : 2;
        case 'indépendant':
          return structuration >= 3 ? 3 : 2;
        default: return 2;
      }
    })();

    const structureBonus  = structuration >= 4 ? 4 : structuration >= 2 ? 2 : 0;
    const partnerBonus    = profile.partenariat_sgpme ? 3 : 0;

    const creditTypeBonus = (() => {
      const bankBoosts = CREDIT_TYPE_BANK_BOOST[creditType] ?? [];
      const isBankSpecialized = bankBoosts.includes(offer.code);
      switch (creditType) {
        case 'immobilier':    return isBankSpecialized ? 3 : 1;
        case 'investissement':return isBankSpecialized ? 4 : 2;
        case 'tresorerie':    return isBankSpecialized ? 4 : 0;
        case 'auto':          return isBankSpecialized ? 2 : 1;
        case 'consommation':  return isBankSpecialized ? 2 : 0;
        default:              return 0;
      }
    })();

    const anciennete = profile.company_type === 'PME'
      ? profile.anciennete_entreprise
      : profile.anciennete_emploi;
    const seniorityBonus = getSeniorityBonus(anciennete);

    const income   = toNum(
      profile.company_type === 'PME'
        ? toNum(profile.chiffre_affaires) / 12
        : profile.monthly_income,
      0
    );
    const montant  = toNum(profile.montant_demande, 0);
    const debtRatio = income > 0 ? montant / (income * 12) : 5;
    const debtBonus = debtRatio < 1 ? 4 : debtRatio < 2 ? 2 : debtRatio < 3 ? 0 : -3;

    return clamp(
      base + profileBonus + structureBonus + partnerBonus
      + creditTypeBonus + seniorityBonus + debtBonus,
      0, SCORE_WEIGHTS.access
    );
  }

  // Mode services (sans crédit)
  const digital    = (offer.hasOnline ? 8 : 4) + (offer.hasMobile ? 8 : 4);
  const visaBonus  = offer.hasVisa ? 6 : 2;
  const assurBonus = offer.hasInsurance ? 4 : 0;
  const feesPromo  = profile.interests?.low_fees && offer.monthlyFee <= 1500 ? 2 : 0;
  return clamp(digital + visaBonus + assurBonus + feesPromo, 0, SCORE_WEIGHTS.access);
}

function scoreCost(offer: BankOffer, profile: Profile): number {
  const isCredit = profile.needs_credit !== 'no';
  if (isCredit) {
    let rate = offer.baseRate;
    if (profile.partenariat_sgpme) rate -= 2.0;
    if (profile.partenariat_ifc)   rate -= 1.0;
    if (profile.company_type === 'PME') rate -= 0.5;

    if (profile.type_credit === 'immobilier') {
      const apport = toNum(profile.apport_personnel_pct, 0);
      if (apport >= 30)      rate -= 1.5;
      else if (apport >= 20) rate -= 1.0;
      else if (apport >= 10) rate -= 0.5;
    }

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
  if (fee <= 6000)  return 12;
  return 8;
}

function scoreService(offer: BankOffer, profile: Profile): number {
  let score = 0;
  score += offer.hasOnline    ? 6 : 2;
  score += offer.hasMobile    ? 6 : 2;
  score += offer.hasVisa      ? 5 : 1;
  score += offer.hasInsurance ? 3 : 0;
  if (profile.interests?.visa_premium    && offer.hasInternationalVisa) score += 3;
  if (profile.interests?.low_fees        && offer.monthlyFee <= 1500)   score += 2;
  if (profile.interests?.savings         && offer.monthlyFee === 0)     score += 2;
  if (profile.interests?.business_credit && offer.hasMobile && offer.hasOnline) score += 1;
  if (profile.interests?.mortgage        && offer.hasVisa)              score += 1;

  const autonomieNeed = toNum(profile.besoin_autonomie, 3);
  if (autonomieNeed >= 4) {
    if (offer.scoreAutonomieBase >= 12)  score += 3;
    else if (offer.scoreAutonomieBase >= 10) score += 1;
  } else if (autonomieNeed <= 2 && offer.scoreAutonomieBase <= 10) {
    score += 1;
  }

  return clamp(score, 0, SCORE_WEIGHTS.service);
}

function scoreTrust(offer: BankOffer, profile: Profile): number {
  const baseTrust  = clamp(Math.round((offer.reliability / 100) * 12), 0, 12);
  const partner    = clamp(offer.scorePartenariats, 0, 6);
  const autonomie  = offer.scoreAutonomieBase >= 12 ? 3 : offer.scoreAutonomieBase >= 10 ? 2 : 1;
  const stability  = offer.reliability >= 85 ? 2 : offer.reliability >= 70 ? 1 : 0;

  let bonus = 0;

  const secteur    = profile.secteur_activite ?? '';
  const bankSectors = BANK_SECTOR_AFFINITY[offer.code] ?? [];
  if (secteur && bankSectors.some(s => secteur.includes(s.split('/')[0].trim()))) {
    bonus += 2;
  }

  if (profile.statut === 'fonctionnaire' && profile.corps_fonction) {
    const bankCorps = BANK_CORPS_AFFINITY[offer.code] ?? [];
    if (bankCorps.includes(profile.corps_fonction)) bonus += 2;
  }

  if (profile.company_type === 'PME') {
    const tailleScore = getTailleScore(profile.taille_entreprise);
    if (tailleScore >= 3) {
      if (['BRIDGE', 'SGCI', 'BICICI'].includes(offer.code)) bonus += 2;
    } else if (tailleScore <= 1) {
      if (['CORIS', 'BNI', 'BDU'].includes(offer.code)) bonus += 2;
    }
    const seniorityEntreprise = getSeniorityBonus(profile.anciennete_entreprise);
    bonus += Math.min(seniorityEntreprise, 2);
  }

  return clamp(baseTrust + partner + autonomie + stability + bonus, 0, SCORE_WEIGHTS.trust);
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
    const trust   = scoreTrust(offer, profile);
    const score   = clamp(Math.round(access + cost + service + trust), 0, 100);

    return {
      ...bank,
      ...offer,
      score,
      scoreBreakdown:        { access, cost, service, trust },
      taux_estime:           needsCredit
                               ? `${offer.baseRate.toFixed(1)}`
                               : `${offer.monthlyFee.toLocaleString('fr-FR')} F/mois`,
      probabilite:           getProbability(score, needsCredit),
      garantie_requise:      needsCredit ? 'Sur dossier' : 'Non requise',
      dependance_conseiller: offer.scoreAutonomieBase >= 11 ? 'Faible' : 'Moyenne',
      comment:               getComment(score, needsCredit),
    };
  });
}
