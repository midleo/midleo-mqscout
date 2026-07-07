const path = require('path');

module.exports = () => ({
  entry: {
    main: './src/main/main.ts',
  },
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, '../../dist/main'),
    filename: 'electron-main.js',
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
