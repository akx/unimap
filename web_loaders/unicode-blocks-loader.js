var _ = require("lodash");
module.exports = function(source) {
    this.cacheable && this.cacheable();
    var ranges = [];
    var direct = {};
    var lines = _(source).split("\n").reject(function(s){return /^#/.test(s)}).compact().value();
    _.map(lines, function(line) {
        var startEndMatch = /^([0-9a-f]+)\.\.([0-9a-f]+)\s*;\s*(.+?)(#.+)?$/i.exec(line);
        if(startEndMatch) {
            ranges.push({
                start: parseInt(startEndMatch[1], 16),
                end: parseInt(startEndMatch[2], 16),
                result: _.trim(startEndMatch[3])
            });
            return;
        }
        var startOnlyMatch = /^([0-9a-f]+)\s*;\s*(.+?)(#.+)?$/i.exec(line);
        if(startOnlyMatch) {
            var c = parseInt(startOnlyMatch[1], 16);
            direct[c] = _.trim(startOnlyMatch[2]);
        }
    });
    var code = [];
    var list = _.union(_.pluck(ranges, "result"), _.values(direct)).sort();

    code.push("var ranges = " + JSON.stringify(ranges) + ";");
    code.push("var direct = " + JSON.stringify(direct) + ";");
    code.push("module.exports.get = function(c) {\n" +
    "if(direct[c]) return direct[c];" +
    "for(var i = 0; i < ranges.length; i++) {\n" +
    "  if(c >= ranges[i].start && c <= ranges[i].end) return ranges[i].result;\n" +
    "}\n" +
    "};");
    code.push("module.exports.list = " + JSON.stringify(list) + ";");
    return code.join("\n");
};
