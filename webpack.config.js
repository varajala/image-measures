const path = require("path");

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  output: {
    path: path.resolve( __dirname + '/public/build'),
    filename: 'app.bundle.js'
  },
  devServer: {
      host: "127.0.0.1",
      port: 8080,
      devMiddleware: {
          publicPath: '/public',
          writeToDisk: true,
      }
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
