/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        resume: ['var(--font-source-sans)', '"Source Sans 3"', '"Source Sans Pro"', 'sans-serif'],
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer-slide': {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(150%)' },
        },
      },
      animation: {
        'gradient-flow': 'gradient-flow 5s ease infinite',
        'shimmer-slide': 'shimmer-slide 2.5s infinite linear',
      },
    },
  },
  plugins: [],
};
