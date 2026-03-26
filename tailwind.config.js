/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        rose: 'var(--rose)',
        blush: 'var(--blush)',
        gold: 'var(--gold)',
        lavender: 'var(--lavender)',
        mint: 'var(--mint)',
        white: 'var(--white)',
      },
      fontFamily: {
        romance: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        quote: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        rose: '0 0 20px rgba(232,103,138,0.2), 0 0 60px rgba(232,103,138,0.1), 0 20px 60px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
