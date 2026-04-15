'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Gestion "Se souvenir de moi" côté client.
 * - Si l'utilisateur n'a PAS coché "Se souvenir de moi" et ouvre un nouveau navigateur
 *   (sessionStorage vide), sa session est automatiquement détruite.
 * - Si "Se souvenir de moi" est coché, la session Supabase persiste normalement.
 */
export function SessionGuard() {
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const uid = session.user.id;
      const remembered  = localStorage.getItem(`ctb_remember_${uid}`) === 'true';
      const tabActive   = sessionStorage.getItem(`ctb_tab_${uid}`);

      if (!remembered && !tabActive) {
        // Nouveau navigateur + pas de "remember me" → déconnexion automatique
        supabase.auth.signOut();
        return;
      }
      // Marquer cet onglet comme actif (dure le temps de la session navigateur)
      sessionStorage.setItem(`ctb_tab_${uid}`, 'true');
    });
  }, []);

  return null;
}
