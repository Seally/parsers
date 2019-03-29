const util = require('util');
const moo = require('moo');

function sliceQuotes(quotedString) {
    return quotedString.slice(1, -1);
}

const tokenNoPlusRgxStr = "[!#$%&'*\\-\\.^`|~\\w]+";
const tokenRgxStr       = "[!#$%&'*+\\-\\.^`|~\\w]+";

const subtypeRgxStr     = `^(?:((?:vnd|prs|x))\\.)?(?:(${tokenRgxStr})\\+(${tokenNoPlusRgxStr})|(${tokenRgxStr}))$`;

let lexer = moo.compile({
    '/': '/',
    '+': '+',
    ';': ';',
    '=': '=',
    spaces: /[ \t]+/,
//    tree: [ "vnd.", "prs.", "x." ],
    // same as token, but does not allow '+'
//    subtypeToken: RegExp(tokenNoPlusRgxStr) // /[!#$%&'*\-\.^`|~\w]+/,
    token:        RegExp(tokenRgxStr),       // /[!#$%&'*+\-\.^`|~\w]+/,
    // Source: https://tools.ietf.org/html/rfc7230#section-3.2.6
    quotedString: {
        match: /"(?:\\[\t !-~\u0080-\u00ff]|[\t !#-[\]-~\u0080-\u00ff])*"/,
        value: (val) => sliceQuotes(val)
    }
});


let srcTxt = `text/vnd.vnd.tiddvnd.lywiki`;

console.log('Input:');
console.log(srcTxt);

lexer.reset(srcTxt);

let token;

while((token = lexer.next())) {
    console.log(token.type, ":", util.inspect(token.value, { depth: null }));
}