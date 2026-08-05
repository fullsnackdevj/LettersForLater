/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F6F2EB',
          200: '#EFE9DE',
          300: '#E2D7C7',
          400: '#C8B9A6',
          500: '#9E8B75',
          800: '#4A3B2C',
          900: '#36271C',
        },
        terracotta: {
          500: '#C86D51',
          600: '#B0583C',
        },
        vintageRed: {
          600: '#A83232',
          700: '#8B0000',
        },
        gold: {
          400: '#F3E5AB',
          500: '#D4AF37',
          600: '#AA7C11',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        typewriter: ['Courier Prime', 'monospace'],
        handwriting: ['Caveat', 'cursive'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
