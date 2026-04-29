/**
 * ──────────────────────────────────────────────────────
 *  REGISTRE DES BANQUES PARTENAIRES — CompareTaBanque
 * ──────────────────────────────────────────────────────
 *  Pour ajouter une nouvelle banque :
 *  1. Déposer son logo dans  web/public/logos/<code>.png
 *  2. Ajouter une entrée dans le tableau PARTNER_BANKS ci-dessous
 *  3. Ajouter son profil dans la base Supabase (bank_profiles)
 *  4. Ajouter ses tarifs dans bank_tariffs
 *  C'est tout. Aucune autre modification de code n'est nécessaire.
 * ──────────────────────────────────────────────────────
 */

export interface BankEntry {
  /** Code interne utilisé dans le scoring (doit correspondre à bank_profiles.bank_code) */
  code: string;
  /** Nom affiché à l'utilisateur */
  name: string;
  /** Chemin du logo depuis /public  */
  logo: string;
  /** Pays / zone (affiché dans le footer ou les filtres futurs) */
  zone?: string;
  /** true si le logo a un fond sombre (le container sera noir au lieu de blanc) */
  darkBg?: boolean;
}

export const PARTNER_BANKS: BankEntry[] = [
  { code: 'CORIS',  name: 'Coris Bank',       logo: '/logos/coris.png',  zone: 'UEMOA' },
  { code: 'NSIA',   name: 'NSIA Banque',       logo: '/logos/nsia.png',   zone: 'UEMOA' },
  { code: 'SIB',    name: 'SIB',               logo: '/logos/sib.png',    zone: 'UEMOA' },
  { code: 'BNI',    name: 'BNI',               logo: '/logos/bni.png',    zone: 'UEMOA' },
  { code: 'SGCI',   name: 'SGBCI',             logo: '/logos/sgbci.png',  zone: 'UEMOA' },
  { code: 'BICICI', name: 'BICICI',             logo: '/logos/bicici.png', zone: 'UEMOA' },
  { code: 'BDU',    name: 'BDU-CI',            logo: '/logos/bdu.png',    zone: 'UEMOA' },
  { code: 'BRIDGE', name: 'Bridge Bank Group', logo: '/logos/bridge.png?v=4', zone: 'UEMOA' },
  // ── Ajouter ici les futures banques ────────────────
  // { code: 'ORABANK', name: 'Orabank',  logo: '/logos/orabank.png', zone: 'UEMOA' },
  // { code: 'GTB',     name: 'GTBank',   logo: '/logos/gtb.png',     zone: 'UEMOA' },
];
