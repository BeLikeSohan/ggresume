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
    },
  },
  plugins: [],
};
