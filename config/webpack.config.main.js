const path = require('path');

module.exports = {
  entry: './dev/bootstrap.main.ts',
  output: {
    path: path.resolve(__dirname, '../dev'),
    filename: 'bootstrap.main.js',
    library: 'bootstrap',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: {

  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  target: 'electron',
  node: {
    __dirname: false
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `awesome-typescript-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};
