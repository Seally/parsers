@{%

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

%}

@lexer lexer

# rules
array      -> _                          {% emptyArray %}
            | _ "[" _ "]" _              {% emptyArray %}
            | _ "[" _ arrayItems _ "]" _ {% function(d) { return d[3]; } %}
            | _ arrayItems _             {% function(d) { return d[1]; } %}

arrayItems -> string (_ "," _ string):*  {% extractArrayContents %}

string     -> %quotedString              {% idValue %}
            | %rawString                 {% idValue %}

_          -> null | %whitespace         {% nuller %}

@{%

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

%}