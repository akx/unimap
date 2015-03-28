var _ = require("lodash");
module.exports = function(source) {
    this.cacheable && this.cacheable();
    var names = {};
    var aliases = {};
    var lastCodepoint = null;
    var highestCodepoint = 0;
    var lines = _(source).split("\n").reject(function(s){return /^@/.test(s)}).compact().value();
    _.map(lines, function(line) {
        var m = /^([0-9a-f]+)\s+(.+)$/i.exec(line);
        if(m) {
            var codepoint = parseInt(m[1], 16);
            names[codepoint] = m[2];
            lastCodepoint = codepoint;
            highestCodepoint = Math.max(highestCodepoint, codepoint);
            return;
        }
        m = /^\t=\s*(.+)$/.exec(line);
        if(m && lastCodepoint) {
            (aliases[lastCodepoint] || (aliases[lastCodepoint] = [])).push(m[1]);
        }
    });
    var code = [];
    code.push("var names = " + JSON.stringify(names) + ";");
    code.push("var aliases = " + JSON.stringify(aliases) + ";");
    code.push("module.exports.getName = function(c) {\n" +
    "return names[c] || '???';\n" +
    "};");
    code.push("module.exports.getAliases = function(c) {\n" +
    "return aliases[c] || [];\n" +
    "};");
    code.push("module.exports.highestCodepoint = " + highestCodepoint + ";");
    return code.join("\n");
};
