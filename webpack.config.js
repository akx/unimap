module.exports = {
    entry: "./src/unimap.js",
    module: {
        loaders: [
            {test: /\.js(x?)$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.msx$/, loader: 'msx-loader?harmony=true'}
        ]
    },
    output: {
        path: "build",
        filename: "unimap.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
