// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require('moo');

function sliceQuotes(quotedString) {
    return quotedString.slice(1, -1);
}

let lexer = moo.compile({
    '[': '[', // opening square bracket
    ']': ']', // closing square bracket
    ',': ',', // comma
    whitespace: { match: /\s+/, lineBreaks: true },
    quotedString: [
        {
            match: /'(?:\\'|[^'])*'/,
            lineBreaks: true,
            value: (val) => sliceQuotes(val).replace(/\\'/gm, '\'')
        },
        {
            match: /"(?:\\"|[^"])*"/,
            lineBreaks: true,
            value: (val) => sliceQuotes(val).replace(/\\"/gm, '"')
        },
        {
            match: /`(?:\\`|[^`])*`/,
            lineBreaks: true,
            value: (val) => sliceQuotes(val).replace(/\\`/gm, '`')
        },
    ],
    rawString: {
        match: /(?:\\.|[^,[\]])*(?:\\.|[^\s\],])/,
        lineBreaks: true,
        value: (val) => val.replace(/\\(.)/gm, "$1")
    }
});




function nuller() {
    return null;
}

function emptyArray() {
    return [];
}

function idValue(d) {
    return d[0].value;
}

function extractArrayContents(d) {
    let output = [ d[0] ];

    for(let tokens of d[1]) {
        output.push(tokens[3]);
    }

    return output;
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "array", "symbols": ["_"], "postprocess": emptyArray},
    {"name": "array", "symbols": ["_", {"literal":"["}, "_", {"literal":"]"}, "_"], "postprocess": emptyArray},
    {"name": "array", "symbols": ["_", {"literal":"["}, "_", "arrayItems", "_", {"literal":"]"}, "_"], "postprocess": function(d) { return d[3]; }},
    {"name": "array", "symbols": ["_", "arrayItems", "_"], "postprocess": function(d) { return d[1]; }},
    {"name": "arrayItems$ebnf$1", "symbols": []},
    {"name": "arrayItems$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "string"]},
    {"name": "arrayItems$ebnf$1", "symbols": ["arrayItems$ebnf$1", "arrayItems$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arrayItems", "symbols": ["string", "arrayItems$ebnf$1"], "postprocess": extractArrayContents},
    {"name": "string", "symbols": [(lexer.has("quotedString") ? {type: "quotedString"} : quotedString)], "postprocess": idValue},
    {"name": "string", "symbols": [(lexer.has("rawString") ? {type: "rawString"} : rawString)], "postprocess": idValue},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("whitespace") ? {type: "whitespace"} : whitespace)], "postprocess": nuller}
]
  , ParserStart: "array"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
