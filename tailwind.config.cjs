/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0B1B2B',
          800: '#12263B',
          700: '#19304A',
          600: '#243E5D',
          500: '#2D5076',
        },
        mint: {
          500: '#2DD4BF',
          400: '#5EEAD4',
        },
        coral: {
          500: '#FF7A5C',
          400: '#FF9A84',
        },
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(45, 212, 191, 0.35)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'mesh': 'radial-gradient(circle at top left, rgba(45, 212, 191, 0.2), transparent 45%), radial-gradient(circle at top right, rgba(255, 154, 132, 0.18), transparent 40%), radial-gradient(circle at 30% 70%, rgba(45, 212, 191, 0.12), transparent 45%)',
      },
    },
  },
  plugins: [],
};
