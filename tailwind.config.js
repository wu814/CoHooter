/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kahoot: {
          purple: '#46178F',
          'purple-light': '#864CBF',
          'purple-dark': '#2D0A5E',
          'purple-deep': '#1C0545',
          red: '#E21B3C',
          blue: '#1368CE',
          yellow: '#D89E00',
          green: '#26890C',
          orange: '#FF6F00',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
