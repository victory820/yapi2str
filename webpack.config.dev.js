const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {  
    'background': './background.js',
    'content': './js/content.js',
    'popup': './js/popup.js'
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'background' ? '[name].js' : 'js/[name].js'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8 * 1024
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'dist/css/[name].css'
    }),
    new HtmlWebpackPlugin({
      template: './popup.html',
      filename: 'popup.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: './manifest.json', to: 'manifest.json' },
        { from: './css', to: 'css' },
        { from: './images', to: 'images' }
      ]
    })
  ]
}
