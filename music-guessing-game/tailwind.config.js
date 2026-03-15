/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0F172A',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(148 163 184 / 0.2), 0 10px 30px rgb(14 165 233 / 0.15)',
      },
    },
  },
  plugins: [],
};
