var bl = require("./web_loaders/unicode-blocks-loader.js");
var nl = require("./web_loaders/unicode-names-loader.js");
var fs = require("fs");
var blocksData = fs.readFileSync("./src/Blocks.txt", "UTF-8");
var scriptsData = fs.readFileSync("./src/Scripts.txt", "UTF-8");
var namesData = fs.readFileSync("./src/NamesList.txt", "UTF-8");
console.log(bl(blocksData));
console.log(bl(scriptsData));
console.log(nl(namesData));
