const assert = require('assert');
const util = require('util');

const nearley = require("nearley");
const grammar = require("./stringarray-parser.js");

let parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed("[Fire, Water]");

console.log(util.inspect(parser.results, { depth: null }));

for(let item of parser.results[0]) {
    console.log(item);
}

if(parser.results.length > 1) {
    for(let i = 0; i < parser.results.length - 1; ++i) {
        assert.deepStrictEqual(parser.results[i], parser.results[i + 1]);
    }

    console.log("All objects are equal.");
}
