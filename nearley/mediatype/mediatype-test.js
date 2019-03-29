const { parse } = require( "./mediatype");

let input = "text/vnd.tiddlywiki";

let parseResult = parse(input);

console.log(parseResult);
