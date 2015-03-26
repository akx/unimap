module.exports = {
    entry: "./src/unimap.js",
    module: {
        loaders: [
            {test: /\.js(x?)$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    output: {
        path: ".",
        filename: "unimap.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
