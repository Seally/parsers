const util = require('util');
const { parse } = require( "./methodcall");

let input = "replace('\\'some\n\\\"thing\\'')";

let parseResult = parse(input);

console.log(util.inspect(parseResult, { depth: null }));
console.log(parseResult[0].args[0]);