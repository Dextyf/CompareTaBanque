'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router  = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const goToComparateur = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push('/auth'); return; }
    const hasConsent = localStorage.getItem(`ctb_consent_${session.user.id}`) === 'granted';
    router.push(hasConsent ? '/comparateur' : '/consent');
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-fintech-dark)] text-white font-sans overflow-x-hidden selection:bg-[color:var(--color-fintech-accent)] selection:text-white">

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
          <Image
            src="/logos/logo-compare-ta-banque.png"
            alt="CompareTaBanque"
            width={200} height={80}
            className="h-14 md:h-20 w-auto bg-white px-4 py-2 rounded-2xl shadow-xl object-contain"
          />
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-sm md:text-base font-bold">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition-all uppercase tracking-widest text-[10px] md:text-xs"
              >
                Mon Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 text-slate-300 hover:bg-red-500/20 hover:text-red-400 px-5 py-3 rounded-full transition-all text-xs uppercase tracking-widest font-black"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-slate-300 hover:text-white transition-all uppercase tracking-widest text-[10px] md:text-xs"
              >
                Connexion
              </Link>
              <Link
                href="/auth"
                className="bg-[color:var(--color-fintech-accent)] text-white px-6 md:px-8 py-3 rounded-full hover:bg-black transition-all shadow-xl text-xs md:text-sm uppercase tracking-widest font-black"
              >
                Trouver ma banque
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <main className="container mx-auto px-6 pt-12 md:pt-20 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Texte */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-tight tracking-tighter">
              Votre banque <br className="hidden md:block" />
              <span className="text-[color:var(--color-fintech-accent)] italic">sur-mesure.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 font-medium">
              Analysez les grilles tarifaires de la BNI, NSIA, SIB, SGBCI et Coris en 2 minutes.
              Notre IA identifie l&apos;offre imbattable pour votre profil.
            </p>
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={goToComparateur}
                className="w-full sm:w-auto bg-[color:var(--color-fintech-blue)] text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Démarrer la comparaison <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Visuel */}
          <div className="lg:w-1/2 relative mt-8 lg:mt-0 flex justify-center">
            <div className="relative z-10 w-full max-w-lg">
              <Image
                src="/assets/couple_app.png"
                alt="Couple Banking"
                width={600} height={500}
                className="rounded-[3rem] shadow-2xl border border-white/5 w-full"
                priority
              />
              <div className="absolute -bottom-10 -left-6 md:-left-12 bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-slate-50 [animation:var(--animate-float)]">
                <div className="bg-[color:var(--color-fintech-accent)] p-3 rounded-2xl text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-black uppercase">Sécurité</p>
                  <p className="text-xl font-black text-slate-900">100% Crypté</p>
                </div>
              </div>
              <div className="absolute -top-10 -right-4 md:-right-8 bg-[color:var(--color-fintech-blue)] p-8 rounded-[2.5rem] shadow-2xl text-white border border-white/10 hidden sm:block [animation:var(--animate-float-delayed)]">
                <TrendingUp size={36} className="mb-2 text-[color:var(--color-fintech-accent)]" />
                <p className="text-xs uppercase font-black text-blue-100">Gain Moyen / AN</p>
                <p className="text-4xl font-black">120k FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Solutions Particuliers / Entreprises ──────────────── */}
      <section className="container mx-auto px-6 py-24 md:py-32 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 px-2">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Une expertise dédiée.</h2>
          <p className="text-slate-400 font-medium text-lg md:text-xl">
            Particuliers ou Entreprises : l&apos;IA adapte ses algorithmes à votre statut juridique et fiscal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="group relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/10 transform hover:-translate-y-4">
            <div className="relative h-64 md:h-96 overflow-hidden rounded-[2.5rem]">
              <Image
                src="/assets/woman_app.png"
                alt="Particuliers"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-8 md:p-10">
              <h3 className="text-3xl font-black mb-4">Pour Particuliers</h3>
              <p className="text-slate-400 mb-8 font-medium">
                Optimisez vos frais, trouvez le meilleur taux de Crédit Immobilier et profitez d&apos;une épargne optimale.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="text-white bg-white/10 hover:bg-[color:var(--color-fintech-accent)] px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3"
              >
                Simulation Personnelle <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/10 transform hover:-translate-y-4">
            <div className="relative h-64 md:h-96 overflow-hidden rounded-[2.5rem]">
              <Image
                src="/assets/man_app.png"
                alt="Entreprises"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-8 md:p-10">
              <h3 className="text-3xl font-black mb-4">Pour Entreprises</h3>
              <p className="text-slate-400 mb-8 font-medium">
                SARL, SA ou SNC : accédez aux meilleures grilles de crédit business et facilitez votre trésorerie.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="text-white bg-white/10 hover:bg-[color:var(--color-fintech-blue)] px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3"
              >
                Analyse Corporate <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Banques partenaires ────────────────────────────────── */}
      <section className="bg-white/5 border-y border-white/10 py-16 md:py-24 relative z-10 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-[0.4em] mb-12">
            Grilles Tarifaires Officielles · Zone UEMOA 2026
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <BankLogo src="/logos/coris.png"  alt="Coris Bank" />
            <BankLogo src="/logos/nsia.png"   alt="NSIA Banque" />
            <BankLogo src="/logos/sib.png"    alt="SIB" />
            <BankLogo src="/logos/bni.png"    alt="BNI" />
            <BankLogo src="/logos/sgbci.png"  alt="SGCI" />
            <BankLogo src="/logos/bicici.png" alt="BICICI" />
            <BankLogo src="/logos/bdu.png"    alt="BDU-CI" />
            <BankLogo src="/logos/bridge.png" alt="Bridge Bank" />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-start gap-5">
            <div className="bg-[color:var(--color-fintech-accent)]/20 p-4 rounded-2xl text-[color:var(--color-fintech-accent)] shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="font-black text-lg text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          Prêt à optimiser votre banking ?
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Rejoignez des milliers de clients qui ont économisé plus de 120 000 FCFA/an sur leurs frais bancaires.
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="inline-flex items-center gap-3 bg-[color:var(--color-fintech-accent)] text-white px-12 py-6 rounded-full font-black text-xl hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95"
        >
          Commencer gratuitement <ChevronRight size={24} />
        </button>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">
        © {new Date().getFullYear()} CompareTaBanque · Plateforme de Conseil Financier Indépendante<br />
        CompareTaBanque est un produit et la propriété de EL-KEYON BUILDER SARL &amp; Associés<br />
        Technologie Propulsée par IA Claude
      </footer>
    </div>
  );
}

function BankLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl hover:scale-110 border border-slate-50 flex items-center justify-center w-32 md:w-48 h-20 md:h-28 transition-all">
      <Image src={src} alt={alt} width={160} height={80} className="max-h-full w-auto object-contain" />
    </div>
  );
}

const FEATURES = [
  {
    icon: <ShieldCheck size={28} />,
    title: 'Comparaison transparente',
    desc:  'Toutes les grilles tarifaires vérifiées et mises à jour chaque trimestre.',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Scoring intelligent',
    desc:  'Notre algorithme analyse 12 critères pour trouver votre banque idéale.',
  },
  {
    icon: <CreditCard size={28} />,
    title: 'Mise en relation directe',
    desc:  'Un conseiller bancaire vous contacte sous 24h après votre demande.',
  },
];
