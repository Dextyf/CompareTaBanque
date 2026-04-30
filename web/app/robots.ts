import { MetadataRoute } from 'next';

const BASE_URL = 'https://comparetabanque.ci';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Robots généraux : accès à toutes les pages publiques
        userAgent: '*',
        allow: ['/', '/simulateur', '/comparateur', '/auth'],
        disallow: [
          '/dashboard/',  // espace utilisateur privé
          '/admin/',      // panneau d'administration
          '/api/',        // routes API internes
          '/consent',     // flux de consentement interne
          '/results',     // résultats dynamiques post-comparaison
        ],
      },
      {
        // GPTBot (OpenAI) — on permet l'indexation pour la visibilité IA
        userAgent: 'GPTBot',
        allow: ['/', '/simulateur', '/comparateur'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/consent', '/results'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
