var webpack = require("webpack");
process.env.NODE_ENV = "production";
module.exports = require("./webpack.config.js");
module.exports.plugins = module.exports.plugins || [];
module.exports.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"'
}));
