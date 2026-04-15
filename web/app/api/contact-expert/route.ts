import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, motif, description } = await req.json() as {
      email: string; motif: string; description: string;
    };

    if (!email || !motif || !description) {
      return NextResponse.json({ ok: false, error: 'Champs manquants' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from:     'CompareTaBanque <onboarding@resend.dev>',
      to:       [process.env.EXPERT_EMAIL!],
      replyTo:  email,
      subject:  `[Expert CTB] ${motif}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <h2 style="color:#00335c;font-size:22px;font-weight:900;margin:0 0 8px;">Nouvelle demande Expert</h2>
          <p style="color:#64748b;font-size:13px;margin:0 0 24px;">CompareTaBanque — Plateforme Conseil Financier</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 16px;background:#fff;border-radius:8px 8px 0 0;border:1px solid #e2e8f0;font-weight:800;color:#0f172a;width:140px;">De</td>
              <td style="padding:12px 16px;background:#fff;border-radius:8px 8px 0 0;border:1px solid #e2e8f0;border-left:none;color:#475569;">${email}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;font-weight:800;color:#0f172a;">Motif</td>
              <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-left:none;color:#475569;">${motif}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;background:#fff;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;font-weight:800;color:#0f172a;vertical-align:top;">Description</td>
              <td style="padding:12px 16px;background:#fff;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;border-left:none;color:#475569;line-height:1.7;">${description.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          <p style="color:#94a3b8;font-size:11px;margin:24px 0 0;text-align:center;">
            Répondez directement à cet email pour contacter l'utilisateur.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[contact-expert] Resend error:', error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact-expert] error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
