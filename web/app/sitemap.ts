import { MetadataRoute } from 'next';

const BASE_URL = 'https://comparetabanque.ci';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // Page d'accueil — point d'entrée principal, mise à jour régulière
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      // Simulateur — outil public, fort potentiel de trafic organique
      url: `${BASE_URL}/simulateur`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      // Comparateur — cœur du produit, page de conversion clé
      url: `${BASE_URL}/comparateur`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Connexion / Inscription — utile pour la découverte, faible valeur SEO directe
      url: `${BASE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // ⛔ Exclus du sitemap (bloqués aussi dans robots.ts) :
    // /consent   → page de flux interne, sans valeur SEO
    // /results   → page dynamique post-comparaison, contenu non permanent
    // /dashboard → espace privé authentifié
    // /admin     → panneau d'administration
  ];
}
