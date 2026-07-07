const path = require('path');

module.exports = () => ({
  entry: {
    preload: './src/preload/preload.ts',
  },
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, '../../dist/preload'),
    filename: 'preload.js',
  },
  devtool: 'source-map',
  externalsPresets: {
    electron: true,
    node: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
});
