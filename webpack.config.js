var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry:[ './example/app.js'],
    output: {
      publicPath: '/example/',
      filename: 'example/bundle.js'
    },
    module: {
        loaders: [

            {
                exclude: /node_modules/,
                test: /\.js$/,
                loader: 'babel',
                query: {
                  presets: ['es2015']
                }
            },

            {
                test: /\.css$/,
                loader: 'style!css'
            }

        ]
    },
    plugins: [
    ]
};
