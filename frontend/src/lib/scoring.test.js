import assert from 'assert';
import { scoreBanks } from './scoring.js';

const banks = [
  {
    id: 1,
    code: 'TEST1',
    name: 'Banque A',
    logo: '/logos/test1.png',
    reliability_score: 92,
    score_partenariats: 6,
    score_autonomie_base: 12,
    banking_tariffs: [
      { target_profile: 'entreprise', monthly_fee: 1200, has_online_banking: true, has_mobile_banking: true, has_visa_card: true, has_international: true, has_insurance: true, credit_rate: 7.2 },
    ]
  },
  {
    id: 2,
    code: 'TEST2',
    name: 'Banque B',
    logo: '/logos/test2.png',
    reliability_score: 50,
    score_partenariats: 2,
    score_autonomie_base: 8,
    banking_tariffs: [
      { target_profile: 'particulier', monthly_fee: 3800, has_online_banking: false, has_mobile_banking: false, has_visa_card: false, has_international: false, has_insurance: false, credit_rate: 12.0 },
    ]
  }
];

const profileCredit = {
  company_type: 'PME',
  statut: 'indépendant',
  monthly_income: 800000,
  needs_credit: 'yes',
  montant_demande: 2500000,
  type_credit: 'investissement',
  niveau_structuration: '4',
  partenariat_sgpme: true,
  partenariat_ifc: true,
  interests: { visa_premium: true, low_fees: true, savings: false, business_credit: true }
};

const profileNoCredit = {
  company_type: 'individual',
  statut: 'salarié_privé',
  monthly_income: 400000,
  needs_credit: 'no',
  interests: { visa_premium: false, low_fees: true, savings: true }
};

const resultsCredit = scoreBanks(banks, profileCredit);
assert.strictEqual(resultsCredit.length, 2, 'Deux banques doivent être notées pour le profil crédit.');
assert(resultsCredit[0].score > resultsCredit[1].score, 'La banque A doit être mieux notée que la banque B pour un profil PME crédit.');
assert(resultsCredit[0].score >= 85, `Banque A devrait obtenir un score d'au moins 85 en crédit, obtenu ${resultsCredit[0].score}.`);
assert(resultsCredit[0].scoreBreakdown.access > 15, 'Accès doit représenter une partie significative du score crédit.');
assert(resultsCredit[0].scoreBreakdown.cost > 18, 'Coût doit être bien valorisé pour un taux compétitif.');

const resultsNoCredit = scoreBanks(banks, profileNoCredit);
assert.strictEqual(resultsNoCredit.length, 2, 'Deux banques doivent être notées pour le profil sans crédit.');
const bankA = resultsNoCredit.find(r => r.code === 'TEST1');
const bankB = resultsNoCredit.find(r => r.code === 'TEST2');
assert(bankA && bankB, 'Les deux banques de test doivent être présentes dans le classement sans crédit.');
assert(bankB.scoreBreakdown.cost < bankA.scoreBreakdown.cost, 'La banque à frais élevés doit recevoir un score coût plus bas que l’offre à frais faibles.');
assert(bankB.scoreBreakdown.service <= bankA.scoreBreakdown.service + 10, 'Les deux banques doivent être comparées par service.');

console.log('✅ scoring.test.js : tous les cas unitaires ont réussi.');
