/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          blue: '#005596',   // Bleu du texte "Compare" et de la loupe
          light: '#1A75C2',  // Nuance plus claire du bleu
          accent: '#8DC63F', // Vert vif du texte "Banque" et du checkmark
          dark: '#00335c',   // Bleu très sombre (marine) pour les fonds
        }
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
