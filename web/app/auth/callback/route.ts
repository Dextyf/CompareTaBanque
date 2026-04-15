import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Route de callback pour la confirmation email Supabase.
 * Supabase envoie l'utilisateur ici après qu'il ait cliqué
 * sur le lien dans son email de confirmation.
 *
 * Flow :
 *  1. Supabase → lien email → /auth/callback?code=XXXX
 *  2. On échange le code contre une session
 *  3. Premier accès → /consent  (formulaire RGPD)
 *  4. Déjà consenti  → /        (accueil connecté)
 *  5. Erreur         → /auth?error=confirmation_failed
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:    () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError?.message);
    return NextResponse.redirect(`${origin}/auth?error=confirmation_failed`);
  }

  // Redirection post-confirmation :
  // Le consentement est stocké côté client (localStorage), donc on
  // redirige vers /consent — la page vérifiera elle-même le localStorage.
  // Si déjà consenti (reconnexion), /consent redirigera vers /comparateur.
  return NextResponse.redirect(`${origin}/consent`);
}
