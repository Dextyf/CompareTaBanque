import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'CompareTaBanque — Zone UEMOA',
    short_name:       'CTB',
    description:      'Comparez les offres bancaires en Côte d\'Ivoire et dans la zone UEMOA',
    start_url:        '/',
    display:          'standalone',
    background_color: '#00335c',
    theme_color:      '#005596',
    orientation:      'portrait',
    icons: [
      { src: '/logos/logo-compare-ta-banque.png', sizes: '192x192', type: 'image/png' },
      { src: '/logos/logo-compare-ta-banque.png', sizes: '512x512', type: 'image/png' },
    ],
    categories: ['finance', 'business'],
  };
}
