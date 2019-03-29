// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require('moo');

function quotedStringValue(quotedString) {
    return quotedString.slice(1, -1).replace(/\\(.)/gm, "$1");
}

let lexer = moo.compile({
    whitespace: { match: /\s+/, lineBreaks: true },
    '(': '(', // opening parenthesis
    ')': ')', // closing parenthesis
    '{': '{', // opening curly brace
    '}': '}', // closing curly brace
    '[': '[', // opening square bracket
    ']': ']', // closing square bracket
    ',': ',', // comma
    ':': ':', // colon
    '.': '.', // period
    number: {
        match: /-?(?:\d|[1-9]\d+)(?:\.\d+)?(?:[eE][-+]?\d+)?\b/,
        value: val => parseFloat(val)
    },
    quotedString: [
        {
            match: /'(?:\\.|[^'])*'/,
            lineBreaks: true,
            value: quotedStringValue
        },
        {
            match: /"(?:\\.|[^"])*"/,
            lineBreaks: true,
            value: quotedStringValue
        },
        {
            match: /`(?:\\.|[^`])*`/,
            lineBreaks: true,
            value: quotedStringValue
        },
    ],
    varName: {
        match: /[^0-9\s()[\]{},:.][^\s()[\]{},:.]*/,
        type: moo.keywords({
            primitiveValue: [ 'true', 'false', 'undefined', 'null' ]
        })
    },
    rawString: /[^\s()[\]{},:.]+/
});




function undef() {
    return undefined;
}

function nuller() {
    return null;
}

function emptyArray() {
    return [];
}

function emptyObject() {
    return {};
}

function idValue(d) {
    return d[0].value;
}

function extractMethods(d) {
    let output = [ d[0] ];

    for(let tokens of d[1]) {
        output.push(tokens[1]);
    }

    return output;
}

function zeroArgsMethod(d) {
    return { name: d[1].value, args: [] };
}

function extractMethod(d) {
    return { name: d[1].value, args: d[2] ? d[2][3] : [] };
}

function extractArgs(d) {
    let output = [ d[0] ];

    for(let tokens of d[1]) {
        output.push(tokens[3]);
    }

    return output;
}

function extractPair(kv, output) {
    if(kv[0]) {
        output[kv[0]] = kv[1];
    }
}

function extractObject(d) {
    let output = {};

    extractPair(d[2], output);

    for(let tokens of d[3]) {
        extractPair(tokens[3], output);
    }

    return output;
}

function extractArray(d) {
    let output = [d[2]];

    for (let tokens of d[3]) {
        output.push(tokens[3]);
    }

    return output;
}

function extractPrimitiveValue(d) {
    switch(d[0].text) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
        case 'undefined':
            return undefined;
    }
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "expression", "symbols": ["_"], "postprocess": emptyArray},
    {"name": "expression", "symbols": ["methods"], "postprocess": id},
    {"name": "methods$ebnf$1", "symbols": []},
    {"name": "methods$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "method"]},
    {"name": "methods$ebnf$1", "symbols": ["methods$ebnf$1", "methods$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "methods", "symbols": ["method", "methods$ebnf$1"], "postprocess": extractMethods},
    {"name": "method", "symbols": ["_", (lexer.has("varName") ? {type: "varName"} : varName), "_", {"literal":"("}, "_", {"literal":")"}, "_"], "postprocess": zeroArgsMethod},
    {"name": "method$ebnf$1$subexpression$1", "symbols": ["_", {"literal":"("}, "_", "args", "_", {"literal":")"}]},
    {"name": "method$ebnf$1", "symbols": ["method$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "method$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "method", "symbols": ["_", (lexer.has("varName") ? {type: "varName"} : varName), "method$ebnf$1", "_"], "postprocess": extractMethod},
    {"name": "args$ebnf$1", "symbols": []},
    {"name": "args$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "value"]},
    {"name": "args$ebnf$1", "symbols": ["args$ebnf$1", "args$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "args", "symbols": ["value", "args$ebnf$1"], "postprocess": extractArgs},
    {"name": "value", "symbols": ["object"], "postprocess": id},
    {"name": "value", "symbols": ["array"], "postprocess": id},
    {"name": "value", "symbols": ["number"], "postprocess": id},
    {"name": "value", "symbols": ["string"], "postprocess": id},
    {"name": "object", "symbols": [{"literal":"{"}, "_", {"literal":"}"}], "postprocess": emptyObject},
    {"name": "object$ebnf$1", "symbols": []},
    {"name": "object$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "pair"]},
    {"name": "object$ebnf$1", "symbols": ["object$ebnf$1", "object$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "object", "symbols": [{"literal":"{"}, "_", "pair", "object$ebnf$1", "_", {"literal":"}"}], "postprocess": extractObject},
    {"name": "array", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": emptyArray},
    {"name": "array$ebnf$1", "symbols": []},
    {"name": "array$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "value"]},
    {"name": "array$ebnf$1", "symbols": ["array$ebnf$1", "array$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "array", "symbols": [{"literal":"["}, "_", "value", "array$ebnf$1", "_", {"literal":"]"}], "postprocess": extractArray},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": idValue},
    {"name": "string", "symbols": [(lexer.has("primitiveValue") ? {type: "primitiveValue"} : primitiveValue)], "postprocess": extractPrimitiveValue},
    {"name": "string", "symbols": [(lexer.has("quotedString") ? {type: "quotedString"} : quotedString)], "postprocess": idValue},
    {"name": "string", "symbols": [(lexer.has("varName") ? {type: "varName"} : varName)], "postprocess": idValue},
    {"name": "string", "symbols": [(lexer.has("rawString") ? {type: "rawString"} : rawString)], "postprocess": idValue},
    {"name": "pair", "symbols": ["key", "_", {"literal":":"}, "_", "value"], "postprocess": function(d) { return [ d[0], d[4] ]; }},
    {"name": "key", "symbols": ["number"], "postprocess": id},
    {"name": "key", "symbols": ["string"], "postprocess": id},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("whitespace") ? {type: "whitespace"} : whitespace)], "postprocess": nuller}
]
  , ParserStart: "expression"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
