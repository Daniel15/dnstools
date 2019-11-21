const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const {whenProd} = require('@craco/craco');

module.exports = {
  style: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        ...whenProd(
          () => [
            purgecss({
              content: ['./public/*.html', './src/**/*.tsx', './src/**/*.ts'],
            }),
          ],
          [],
        ),
      ],
    },
  },
};
