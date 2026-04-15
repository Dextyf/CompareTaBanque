import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIF_EMAIL = 'sakidesireluc@gmail.com';

/* ── Calcul CPL depuis la grille tarifaire ───────────────── */
function getCPL(income: number): { bracket: string; grade: string; price_ht: number; price_ttc: number } {
  if (income <= 250000)  return { bracket: '0 – 250 000 FCFA',    grade: 'D', price_ht: 1500,  price_ttc: 1770  };
  if (income <= 600000)  return { bracket: '250 001 – 600 000 FCFA', grade: 'C', price_ht: 4000,  price_ttc: 4720  };
  if (income <= 800000)  return { bracket: '600 001 – 800 000 FCFA', grade: 'B', price_ht: 7500,  price_ttc: 8850  };
  if (income <= 1200000) return { bracket: '800 001 – 1 200 000 FCFA', grade: 'A', price_ht: 12500, price_ttc: 14750 };
  return                        { bracket: '> 1 200 000 FCFA',     grade: 'A+', price_ht: 15000, price_ttc: 17700 };
}

const GRADE_COLOR: Record<string, string> = {
  'A+': '#005596', A: '#1A75C2', B: '#8DC63F', C: '#f59e0b', D: '#94a3b8',
};

/* ── Template email HTML ─────────────────────────────────── */
function buildEmail(data: Record<string, unknown>): string {
  const income  = Number(data.monthly_income ?? 0);
  const cpl     = getCPL(income);
  const score   = Number(data.score ?? 0);
  const gradeColor = GRADE_COLOR[cpl.grade] ?? '#005596';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:#00335c;padding:32px 40px;text-align:center;">
    <p style="color:#8DC63F;font-size:11px;font-weight:900;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">
      COMPARETABANQUE · NOUVEAU LEAD
    </p>
    <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">
      ${String(data.bank_name ?? 'Banque')}
    </h1>
    <p style="color:#94a3b8;font-size:13px;margin:8px 0 0;">${new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
  </td></tr>

  <!-- Grade Badge -->
  <tr><td style="padding:32px 40px 0;text-align:center;">
    <div style="display:inline-block;background:${gradeColor};color:#fff;font-size:36px;font-weight:900;width:80px;height:80px;border-radius:50%;line-height:80px;text-align:center;margin-bottom:8px;">
      ${cpl.grade}
    </div>
    <p style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">Grade Lead · Score ${score}%</p>
  </td></tr>

  <!-- Prospect -->
  <tr><td style="padding:24px 40px 0;">
    <h2 style="color:#005596;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
      INFORMATIONS PROSPECT
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Nom complet',    String(data.full_name  ?? '—'))}
      ${row('Email',         String(data.email      ?? '—'))}
      ${row('Téléphone',     String(data.phone      ?? '—'))}
      ${row('Profil',        data.company_type === 'PME' ? 'PME / Entreprise' : 'Particulier')}
      ${row('Statut',        String(data.statut     ?? '—').replace('_', ' '))}
      ${row('Secteur',       String(data.secteur_activite ?? '—'))}
    </table>
  </td></tr>

  <!-- Données financières -->
  <tr><td style="padding:24px 40px 0;">
    <h2 style="color:#005596;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
      DONNÉES FINANCIÈRES
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Revenu mensuel',   `${Number(income).toLocaleString('fr-FR')} FCFA`)}
      ${row('Tranche revenu',   cpl.bracket)}
      ${row('Besoin crédit',    data.needs_credit === 'no' ? 'Non — Compte & Services' : 'Oui')}
      ${data.needs_credit !== 'no' ? row('Montant demandé', `${Number(data.montant_demande ?? 0).toLocaleString('fr-FR')} FCFA`) : ''}
      ${data.needs_credit !== 'no' ? row('Type crédit', String(data.type_credit ?? '—')) : ''}
    </table>
  </td></tr>

  <!-- Analyse IA -->
  <tr><td style="padding:24px 40px 0;">
    <h2 style="color:#005596;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
      ANALYSE DE COMPATIBILITÉ
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Banque sélectionnée', `<strong>${String(data.bank_name ?? '—')}</strong>`)}
      ${row('Score global',        `<strong style="color:${gradeColor}">${score}%</strong>`)}
      ${row('Probabilité',         String(data.probabilite ?? '—'))}
      ${row('Commentaire',         `<em>${String(data.comment ?? '—')}</em>`)}
    </table>
  </td></tr>

  <!-- Valeur commerciale -->
  <tr><td style="padding:24px 40px;">
    <h2 style="color:#005596;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
      VALEUR COMMERCIALE DU LEAD
    </h2>
    <table width="100%" cellpadding="6" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;">
      <tr style="background:${gradeColor};">
        <td style="color:#fff;font-weight:900;font-size:13px;padding:10px 16px;">Grade ${cpl.grade}</td>
        <td style="color:#fff;font-weight:900;font-size:13px;padding:10px 16px;text-align:right;">${cpl.price_ht.toLocaleString('fr-FR')} FCFA HT</td>
      </tr>
      <tr>
        <td style="color:#64748b;font-size:12px;padding:8px 16px;">Prix TTC (TVA 18%)</td>
        <td style="color:#0f172a;font-weight:700;font-size:13px;padding:8px 16px;text-align:right;">${cpl.price_ttc.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    </table>
  </td></tr>

  <!-- Action -->
  <tr><td style="background:#f8fafc;padding:24px 40px;border-top:2px solid #e2e8f0;text-align:center;">
    <p style="color:#64748b;font-size:13px;font-weight:600;margin:0;">
      📞 Contacter <strong>${String(data.full_name ?? 'le prospect')}</strong> au <strong>${String(data.phone ?? '—')}</strong><br>
      puis transmettre le dossier à <strong>${String(data.bank_name ?? '—')}</strong>
    </p>
    <p style="color:#94a3b8;font-size:11px;margin:12px 0 0;">CompareTaBanque · EL-KEYON BUILDER SARL · Zone UEMOA 2026</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:6px 0;width:42%;">${label}</td>
    <td style="color:#0f172a;font-size:14px;font-weight:600;padding:6px 0;">${value}</td>
  </tr>`;
}

/* ── Handler POST ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as Record<string, unknown>;
    const bankName  = String(data.bank_name  ?? 'Banque inconnue');
    const fullName  = String(data.full_name  ?? 'Prospect');
    const income    = Number(data.monthly_income ?? 0);
    const cpl       = getCPL(income);
    const score     = Number(data.score ?? 0);

    const { error } = await resend.emails.send({
      from:    'CompareTaBanque <onboarding@resend.dev>',
      to:      [NOTIF_EMAIL],
      subject: `🏦 Lead Grade ${cpl.grade} — ${bankName} — ${fullName} (${score}%)`,
      html:    buildEmail(data),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('lead-notify error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
