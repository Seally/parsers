const { parse } = require( "./methodcall");

let input = "trueAndFalse(true, abc, false, undefined, null, 15.6)";

let parseResult = parse(input);

console.log(parseResult);
