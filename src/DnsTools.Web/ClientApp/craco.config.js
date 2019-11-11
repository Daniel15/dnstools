const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  style: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        purgecss({
          content: ['./public/*.html', './src/**/*.tsx', './src/**/*.ts'],
        }),
      ],
    },
  },
};
