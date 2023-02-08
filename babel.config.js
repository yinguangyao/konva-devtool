module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-transform-runtime'
  ],
  sourceMaps: true
};
