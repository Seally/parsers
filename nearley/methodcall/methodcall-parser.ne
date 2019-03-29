@{%

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

%}

@lexer lexer

# rules
expression -> _                                   {% emptyArray %}
            | methods                             {% id %}

methods    -> method ("." method):*               {% extractMethods %}

method     -> _ %varName _ "(" _ ")" _            {% zeroArgsMethod %}
            | _ %varName (_ "(" _ args _ ")"):? _ {% extractMethod %}

args       -> value (_ "," _ value):*             {% extractArgs %}

value      -> object                              {% id %}
            | array                               {% id %}
            | number                              {% id %}
            | string                              {% id %}

object     -> "{" _ "}"                           {% emptyObject %}
            | "{" _ pair (_ "," _ pair):* _ "}"   {% extractObject %}

array      -> "[" _ "]"                           {% emptyArray %}
            | "[" _ value (_ "," _ value):* _ "]" {% extractArray %}

number     -> %number                             {% idValue %}

string     -> %primitiveValue                     {% extractPrimitiveValue %}
            | %quotedString                       {% idValue %}
            | %varName                            {% idValue %}
            | %rawString                          {% idValue %}

pair       -> key _ ":" _ value                   {% function(d) { return [ d[0], d[4] ]; } %}

key        -> number                              {% id %}
            | string                              {% id %}

_          -> null | %whitespace                  {% nuller %}

@{%

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

%}