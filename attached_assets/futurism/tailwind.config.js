const colorVariable = require('@mertasan/tailwindcss-variables/colorVariable');

module.exports = {
  mode: 'layers',
  content: ['*.html', './src/js/*.js', './docs/*.html', './apps/*.html', './auth/*.html', './dashboard/*.html', './components/*.html', './content/*.html', './forms/*.html', './users/*.html', './pages/*.html'],
  darkMode: 'class',

  theme: {
    fontFamily: {
      sans: ['Rajdhani', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      colors: {
        primary: {
          50: colorVariable('var(--colors-primary-50)'),
         100: colorVariable('var(--colors-primary-100)'),
         200: colorVariable('var(--colors-primary-200)'),
         300: colorVariable('var(--colors-primary-300)'),
         400: colorVariable('var(--colors-primary-400)'),
         500: colorVariable('var(--colors-primary-500)'),
         600: colorVariable('var(--colors-primary-600)'),
         700: colorVariable('var(--colors-primary-700)'),
         800: colorVariable('var(--colors-primary-800)'),
         900: colorVariable('var(--colors-primary-900)'),
         950: colorVariable('var(--colors-primary-950)')
       }
      }
    },
    variables: {
      DEFAULT: {
        colors: {
          primary: {
             50: '#ebfffd',
            100: '#ccfffb',
            200: '#9ffffa',
            300: '#02fafc',
            400: '#00dde3',
            500: '#00b1bf',
            600: '#0a8f8e',
            700: '#0e707c',
            800: '#105c69',
            900: '#043d48',
            950: '#051819'
          }    
        }
      }
    }
  },
  variants: {
    extend: {
       backgroundOpacity: ['dark']
    }
  },
  plugins: [
    require('@mertasan/tailwindcss-variables')({
      colorVariables: true,
    })
  ]
}