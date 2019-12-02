const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const {whenProd} = require('@craco/craco');

module.exports = {
  style: {
    postcss: {
      plugins: [
        autoprefixer,
        ...whenProd(
          () => [
            purgecss({
              content: [
                './public/*.html',
                './src/**/*.tsx',
                './src/**/*.ts',
                '../Views/**/*.cshtml',
                '../legacy/public/*.php',
              ],
            }),
          ],
          [],
        ),
      ],
    },
  },
};
