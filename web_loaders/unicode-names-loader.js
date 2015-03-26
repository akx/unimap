var _ = require("lodash");
module.exports = function(source) {
    this.cacheable && this.cacheable();
    var names = {};
    var lines = _(source).split("\n").reject(function(s){return /^@/.test(s)}).compact().value();
    _.map(lines, function(line) {
        var m = /^([0-9a-f]+)\s+(.+)$/i.exec(line);
        if(m) names[parseInt(m[1], 16)] = m[2];
    });
    var code = [];
    code.push("var names = " + JSON.stringify(names) + ";");
    code.push("module.exports = function(c) {\n" +
    "return names[c] || '???';\n" +
    "};");
    return code.join("\n");
};
