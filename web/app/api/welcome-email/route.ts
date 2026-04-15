import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/* ── Template email de bienvenue + consentement RGPD ─────── */
function buildWelcomeEmail(email: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bienvenue sur CompareTaBanque</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

  <!-- Header -->
  <tr>
    <td style="background:#00335c;padding:40px;text-align:center;">
      <p style="color:#8DC63F;font-size:10px;font-weight:900;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;">
        CompareTaBanque · Zone UEMOA ${year}
      </p>
      <h1 style="color:#ffffff;font-size:32px;font-weight:900;margin:0;letter-spacing:-0.5px;line-height:1.2;">
        Bienvenue !<br>
        <span style="color:#8DC63F;">Votre compte est créé.</span>
      </h1>
      <p style="color:#94a3b8;font-size:14px;margin:16px 0 0;font-weight:500;">
        Confirmez votre email pour activer votre accès.
      </p>
    </td>
  </tr>

  <!-- Message principal -->
  <tr>
    <td style="padding:40px 40px 0;">
      <p style="color:#0f172a;font-size:16px;font-weight:600;line-height:1.7;margin:0 0 16px;">
        Bonjour,
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.8;margin:0 0 16px;">
        Nous sommes ravis de vous accueillir sur <strong>CompareTaBanque</strong>,
        la plateforme de conseil financier indépendante dédiée aux particuliers
        et entreprises de la zone UEMOA.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.8;margin:0;">
        Avant de commencer, veuillez cliquer sur le bouton de confirmation
        envoyé dans un second email par notre système d'authentification sécurisé.
      </p>
    </td>
  </tr>

  <!-- Séparateur -->
  <tr><td style="padding:32px 40px 0;">
    <hr style="border:none;border-top:2px solid #e2e8f0;margin:0;">
  </td></tr>

  <!-- Section RGPD / Consentement -->
  <tr>
    <td style="padding:32px 40px 0;">
      <h2 style="color:#005596;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">
        🔒 Vos Données &amp; Votre Consentement
      </h2>
      <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 20px;">
        En créant votre compte, vous serez invité(e) à donner votre consentement
        éclairé concernant la collecte et l'utilisation de vos données.
        Voici ce que vous devez savoir :
      </p>

      <!-- Points clés RGPD -->
      ${rgpdPoint('📋', 'Données collectées', 'Profil financier (revenus, statut, besoins bancaires). Ces données servent exclusivement à générer votre comparaison personnalisée.')}
      ${rgpdPoint('🎯', 'Finalité du traitement', 'Scoring IA et matching bancaire. Vos données ne sont jamais revendues à des tiers.')}
      ${rgpdPoint('🏦', 'Partage avec les banques', 'Uniquement avec la banque que vous sélectionnez, et uniquement avec votre accord explicite.')}
      ${rgpdPoint('⏱️', 'Durée de conservation', 'Vos données sont conservées 12 mois après votre dernière connexion, puis supprimées.')}
      ${rgpdPoint('✅', 'Vos droits RGPD', 'Accès, rectification, suppression et portabilité de vos données à tout moment depuis votre tableau de bord.')}
      ${rgpdPoint('📜', 'Base légale', 'Traitement fondé sur votre consentement explicite, conformément à la Directive BCEAO 07/2010/CM/UEMOA.')}
    </td>
  </tr>

  <!-- Séparateur -->
  <tr><td style="padding:32px 40px 0;">
    <hr style="border:none;border-top:2px solid #e2e8f0;margin:0;">
  </td></tr>

  <!-- Droits et contact -->
  <tr>
    <td style="padding:32px 40px 0;">
      <h2 style="color:#005596;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">
        📬 Exercer vos droits
      </h2>
      <p style="color:#475569;font-size:14px;line-height:1.8;margin:0;">
        Pour toute demande relative à vos données personnelles (accès,
        rectification, suppression, opposition), contactez notre DPO :
        <br>
        <a href="mailto:sakidesireluc@gmail.com" style="color:#005596;font-weight:700;text-decoration:none;">
          sakidesireluc@gmail.com
        </a>
      </p>
    </td>
  </tr>

  <!-- Rappel compte -->
  <tr>
    <td style="padding:32px 40px 0;">
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:16px;padding:20px 24px;">
        <p style="color:#0369a1;font-size:13px;font-weight:700;margin:0 0 4px;">
          📧 Votre compte enregistré
        </p>
        <p style="color:#0f172a;font-size:15px;font-weight:900;margin:0;">${email}</p>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8fafc;padding:32px 40px;border-top:2px solid #e2e8f0;margin-top:32px;text-align:center;">
      <p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 8px;">
        CompareTaBanque — Plateforme de Conseil Financier Indépendante
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        EL-KEYON BUILDER SARL &amp; Associés · Zone UEMOA · ${year}<br>
        Technologie propulsée par IA Claude · Standard BCEAO 2026
      </p>
      <p style="color:#cbd5e1;font-size:10px;margin:12px 0 0;">
        Vous recevez cet email car vous venez de créer un compte sur comparetabanque.com
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function rgpdPoint(emoji: string, title: string, desc: string): string {
  return `
  <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;padding:16px;background:#f8fafc;border-radius:12px;border-left:3px solid #005596;">
    <span style="font-size:20px;line-height:1;flex-shrink:0;">${emoji}</span>
    <div>
      <p style="color:#0f172a;font-size:14px;font-weight:800;margin:0 0 4px;">${title}</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">${desc}</p>
    </div>
  </div>`;
}

/* ── Handler POST ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string };
    if (!email) return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });

    const { error } = await resend.emails.send({
      from:    'CompareTaBanque <onboarding@resend.dev>',
      to:      [email],
      subject: '🏦 Bienvenue sur CompareTaBanque — Vos données & votre consentement',
      html:    buildWelcomeEmail(email),
    });

    if (error) {
      console.error('[welcome-email] Resend error:', error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[welcome-email] error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
