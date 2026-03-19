/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#232342',
          lighter: '#2d2d52'
        },
        accent: {
          DEFAULT: '#e94560',
          hover: '#ff6b81'
        }
      }
    }
  },
  plugins: []
}
