/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFBF3',
        sand: '#F5EFE2',
        parchment: '#EFE6D5',
        ink: '#1E242B',
        slateMuted: '#5B6470',
        emeraldBrand: '#0D7C5F',
        emeraldDark: '#095A45',
        emeraldSoft: '#E3F5EE',
        marigold: '#E85D2F',
        marigoldSoft: '#FFF0EA',
        amberWarm: '#D97706',
        amberSoft: '#FEF3C7',
        indigoAccent: '#4338CA',
        indigoSoft: '#EEF2FF',
        crimson: '#DC2626',
        crimsonSoft: '#FEE2E2',
      },
      fontFamily: {
        sans: ['BalooDa2_400Regular'],
        medium: ['BalooDa2_500Medium'],
        semibold: ['BalooDa2_600SemiBold'],
        bold: ['BalooDa2_700Bold'],
      },
    },
  },
  plugins: [],
};
