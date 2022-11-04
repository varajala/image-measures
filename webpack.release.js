const path = require("path");

module.exports = {
  entry: './src/index.tsx',
  mode: 'production',
  output: {
    path: path.resolve( __dirname + '/public/build'),
    filename: 'app.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
