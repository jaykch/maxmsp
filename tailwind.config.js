/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'monospace']
      },
      colors: {
        surface: {
          DEFAULT: '#0c0c14',
          light: '#141422',
          lighter: '#1c1c30',
          border: 'rgba(255, 255, 255, 0.06)'
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: 'rgba(99, 102, 241, 0.15)'
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#f87171'
        }
      },
      borderRadius: {
        DEFAULT: '8px'
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.15)',
        soft: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }
    }
  },
  plugins: []
}
