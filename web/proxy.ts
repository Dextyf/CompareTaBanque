import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Routes accessibles sans authentification */
const PUBLIC_ROUTES = ['/', '/auth'];

/** Routes réservées aux admins */
const ADMIN_EMAILS = [
  'sakidesireluc@gmail.com',
  'arriko199@gmail.com',
  'jeanenockguikan@gmail.com',
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()  { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchit la session (IMPORTANT — ne pas supprimer)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r) || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.');

  // Non authentifié → redirige vers /auth
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Authentifié sur /auth → redirige selon le rôle
  // NB : on redirige vers '/' (pas '/consent') car le consentement est stocké
  // dans localStorage (client) et ne peut pas être vérifié ici côté serveur.
  // L'auth/page.tsx useEffect gère le bypass consent côté client.
  if (user && pathname === '/auth') {
    const url = request.nextUrl.clone();
    const email = user.email?.toLowerCase() ?? '';
    url.pathname = ADMIN_EMAILS.includes(email) ? '/admin' : '/';
    return NextResponse.redirect(url);
  }

  // Admin check — route /admin protégée
  if (pathname.startsWith('/admin') && user) {
    const email = user.email?.toLowerCase() ?? '';
    if (!ADMIN_EMAILS.includes(email)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos|assets|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
