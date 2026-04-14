const TARGET_PROFILE_MAP = {
  individual: 'particulier',
  PME: 'entreprise',
  entreprise: 'entreprise'
};

const SCORE_WEIGHTS = {
  access: 30,
  cost: 30,
  service: 20,
  trust: 20
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function getTargetProfile(profile) {
  return TARGET_PROFILE_MAP[profile.company_type] || TARGET_PROFILE_MAP[profile.type_pme] || 'particulier';
}

export function selectTariff(bank, targetProfile) {
  const tariffs = bank.banking_tariffs || [];
  const matching = tariffs.filter(t => t.target_profile === targetProfile || t.target_profile === 'mixte');
  return matching[0] || tariffs[0] || {};
}

export function buildBankOffer(bank, profile) {
  const target = getTargetProfile(profile);
  const tariff = selectTariff(bank, target);
  const monthlyFee = normalizeNumber(tariff.monthly_fee || tariff.fees || 0);
  const baseRate = normalizeNumber(tariff.credit_rate || tariff.taux || bank.taux_base_credit || 9.5, 9.5);
  const reliability = clamp(normalizeNumber(bank.reliability_score, 0), 0, 100);
  const hasVisa = !!tariff.has_visa_card;
  const hasInternationalVisa = hasVisa && !!tariff.has_international;
  const hasOnline = !!tariff.has_online_banking;
  const hasMobile = !!tariff.has_mobile_banking;
  const hasInsurance = !!tariff.has_insurance;

  const dynamicPros = [];
  if (hasMobile) dynamicPros.push('App Mobile incluse');
  if (hasVisa) dynamicPros.push('Carte VISA activée');
  if (hasOnline) dynamicPros.push('Accès web 24/7');
  if (hasInsurance) dynamicPros.push('Assurance optionnelle');
  if (dynamicPros.length < 3) dynamicPros.push('Service Client 5 étoiles');

  return {
    id: bank.id,
    code: bank.code,
    name: bank.name,
    logo: bank.logo,
    tariff,
    reliability,
    baseRate,
    monthlyFee,
    hasVisa,
    hasInternationalVisa,
    hasOnline,
    hasMobile,
    hasInsurance,
    scorePartenariats: normalizeNumber(bank.score_partenariats, 0),
    scoreAutonomieBase: normalizeNumber(bank.score_autonomie_base, 0),
    fees_detail: monthlyFee > 0 ? `Pack: ${monthlyFee}F/mois` : 'Compte Gratuit',
    visa_detail: hasVisa ? (hasInternationalVisa ? 'VISA Internationale' : 'VISA Classic') : 'Standard',
    pros: dynamicPros.slice(0, 3)
  };
}

function scoreAccess(offer, profile) {
  const structuration = clamp(normalizeNumber(profile.niveau_structuration, 3), 0, 5);
  const reliability = offer.reliability;
  const isCredit = profile.needs_credit !== 'no';
  const creditType = profile.type_credit || 'consommation';
  const isIndependent = profile.statut === 'indépendant';

  if (isCredit) {
    const base = clamp(Math.round((reliability / 100) * 18), 0, 18);
    const profileBonus = profile.company_type === 'PME'
      ? 5
      : profile.statut === 'fonctionnaire'
      ? 4
      : isIndependent
      ? 3
      : 2;
    const structureBonus = structuration >= 4 ? 4 : structuration >= 2 ? 2 : 0;
    const partnerBonus = profile.partenariat_sgpme ? 3 : 0;
    const creditTypeBonus = creditType === 'immobilier' ? 1 : creditType === 'investissement' ? 2 : 0;
    return clamp(base + profileBonus + structureBonus + partnerBonus + creditTypeBonus, 0, SCORE_WEIGHTS.access);
  }

  const digital = (offer.hasOnline ? 8 : 4) + (offer.hasMobile ? 8 : 4);
  const visaBonus = offer.hasVisa ? 6 : 2;
  const assuranceBonus = offer.hasInsurance ? 4 : 0;
  const feesPromo = profile.interests?.low_fees && offer.monthlyFee <= 1500 ? 2 : 0;
  return clamp(digital + visaBonus + assuranceBonus + feesPromo, 0, SCORE_WEIGHTS.access);
}

function scoreCost(offer, profile) {
  const isCredit = profile.needs_credit !== 'no';
  if (isCredit) {
    let rate = offer.baseRate;
    if (profile.partenariat_sgpme) rate -= 2.0;
    if (profile.partenariat_ifc) rate -= 1.0;
    if (profile.company_type === 'PME') rate -= 0.5;
    rate = Math.max(rate, 4.5);

    if (rate <= 7) return 30;
    if (rate <= 9) return 22;
    if (rate <= 11) return 14;
    return 8;
  }

  const fee = offer.monthlyFee;
  if (fee === 0) return 30;
  if (fee <= 1500) return 24;
  if (fee <= 3000) return 16;
  return 8;
}

function scoreService(offer, profile) {
  let score = 0;
  score += offer.hasOnline ? 6 : 2;
  score += offer.hasMobile ? 6 : 2;
  score += offer.hasVisa ? 5 : 1;
  score += offer.hasInsurance ? 3 : 0;
  if (profile.interests?.visa_premium && offer.hasInternationalVisa) score += 3;
  if (profile.interests?.low_fees && offer.monthlyFee <= 1500) score += 2;
  if (profile.interests?.savings && offer.monthlyFee === 0) score += 2;
  if (profile.interests?.business_credit && offer.hasMobile && offer.hasOnline) score += 1;
  if (profile.interests?.mortgage && offer.hasVisa) score += 1;
  return clamp(score, 0, SCORE_WEIGHTS.service);
}

function scoreTrust(offer, profile) {
  const reliability = offer.reliability;
  const baseTrust = clamp(Math.round((reliability / 100) * 12), 0, 12);
  const partner = clamp(offer.scorePartenariats, 0, 6);
  const autonomie = offer.scoreAutonomieBase >= 12 ? 3 : offer.scoreAutonomieBase >= 10 ? 2 : 1;
  const stability = reliability >= 85 ? 2 : reliability >= 70 ? 1 : 0;
  return clamp(baseTrust + partner + autonomie + stability, 0, SCORE_WEIGHTS.trust);
}

function getProbability(score, needsCredit) {
  if (needsCredit) {
    if (score >= 82) return 'Optimale';
    if (score >= 68) return 'Élevée';
    return 'À renforcer';
  }
  if (score >= 84) return 'Idéal';
  if (score >= 70) return 'Très bon';
  return 'À vérifier';
}

function getComment(score, needsCredit) {
  if (needsCredit) {
    if (score >= 85) return 'Match Crédit Premium. Votre dossier est très bien orienté.';
    if (score >= 70) return 'Match Crédit Standard. Accord probable sans surcharge majeure.';
    return 'Match Crédit fragile. Renforcez votre dossier pour plus de confort.';
  }
  if (score >= 85) return 'Pack Services Idéal. Excellente maîtrise des frais et du service.';
  if (score >= 70) return 'Services Bancaires équilibrés. Bon compromis coût/usage.';
  return 'Priorité frais. Étudiez une offre plus compétitive.';
}

export function scoreBanks(banks, profile) {
  const needsCredit = profile.needs_credit !== 'no';
  return banks.map(bank => {
    const offer = buildBankOffer(bank, profile);
    const access = scoreAccess(offer, profile);
    const cost = scoreCost(offer, profile);
    const service = scoreService(offer, profile);
    const trust = scoreTrust(offer, profile);
    const raw = access + cost + service + trust;
    const score = clamp(Math.round(raw), 0, 100);
    const taux = needsCredit ? offer.baseRate : offer.monthlyFee === 0 ? 0 : offer.monthlyFee;

    return {
      ...bank,
      ...offer,
      score,
      scoreBreakdown: { access, cost, service, trust },
      taux_estime: needsCredit ? taux.toFixed(1) : `${offer.monthlyFee} F/mois`,
      probabilite: getProbability(score, needsCredit),
      garantie_requise: needsCredit ? 'Sur dossier' : 'Non requise',
      dependance_conseiller: offer.scoreAutonomieBase >= 11 ? 'Faible' : 'Moyenne',
      comment: getComment(score, needsCredit),
    };
  });
}
