module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        'notion-light': {
          primary: '#37352f',
          'primary-content': '#ffffff',
          secondary: '#78706a',
          neutral: '#fafafa',
          'base-100': '#ffffff',
          '--rounded-box': '8px',
          '--rounded-btn': '6px',
        },
      },
      'dark',
    ],
  },
}
