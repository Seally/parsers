const { parse } = require( "./stringarray");

let input = "   [   \"abc def\\d\n\", def, ghi   \\   ]   ";

let parseResult = parse(input);

console.log(parseResult);
