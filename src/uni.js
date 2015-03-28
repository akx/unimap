var names = require("!unicode-names!./NamesList.txt");
module.exports = {
    blocks: require("!unicode-blocks!./Blocks.txt"),
    scripts: require("!unicode-blocks!./Scripts.txt"),
    getName: names.getName,
    getAliases: names.getAliases,
    highestCodepoint: names.highestCodepoint
};
