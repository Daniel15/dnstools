const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const {sentryWebpackPlugin} = require("@sentry/webpack-plugin");
const {whenProd} = require('@craco/craco');

module.exports = {
  babel: {
    plugins: [
      'babel-plugin-dev-expression',
    ]
  },
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
  webpack: {
    plugins: {
      add: [
        ...whenProd(
          () => [
            sentryWebpackPlugin({
              authToken: process.env.SENTRY_AUTH_TOKEN,
              org: 'sentry',
              project: 'dnstools-js',
              release: process.env.SENTRY_RELEASE,
              url: 'https://errors.d.sb',
            })
          ],
          []
        ),
      ],
    }
  }
};
