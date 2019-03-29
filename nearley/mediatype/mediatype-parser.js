// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require('moo');

const tokenNoPlusRgx = /[!#$%&'*\-.^`|~\w]+/;
const tokenRgx       = /[!#$%&'*+\-.^`|~\w]+/;
// This one is for extractSubtype() since I can't figure out for the life of
// me how to do (tree ".") subtype ("+" suffix) without ending up with an
// ambiguous grammar or a grammar that won't allow stuff like "vnd.vnd.mytype"
// (only the first "vnd." should count as part of the tree, but the lexer
// doesn't seem to agree).
//
// So I just let a regex take over here in post-processing (lexer itself can't
// use capture groups).
//
// This is declared this way to keep the super-long regex a bit more sane (not
// too successful on front).
//
// Match [0]: Entire string
//       [1]: Tree ("vnd", "prs", "x")
//       [2]: Subtype name (if we have a +suffix)
//       [3]: Suffix
//       [4]: Subtype name (no suffix)
const subtypeRgx = RegExp(`^(?:((?:vnd|prs|x))\\.)?(?:(${tokenRgx.source})\\+(${tokenNoPlusRgx.source})|(${tokenRgx.source}))$`, 'i');

let lexer = moo.compile({
    '/': '/',
    spaces: /[ \t]+/,
    ';': ';',
    '=': '=',
    token: tokenRgx, // EQUALS: /[!#$%&'*+\-.^`|~\w]+/
    quotedString: {
        match: /"(?:\\[\t !-~\u0080-\u00ff]|[\t !#-[\]-~\u0080-\u00ff])*"/,
        value: (val) => val.slice(1, -1)
    }
});




function nuller() {
    return null;
}

function nullIfUndefined(value) {
    return value === undefined ? null : value;
}

function extractMediaType(d) {
    return {
        noParams: d[0].text + d[1].text + d[2].text,
        type:     d[0].value,
        subtype:  extractSubtype(d[2]),
        params:   d[3]
    };
}

function extractSubtype(d) {
    const subtypeStr = d.value;

    const subtypeMatches = subtypeStr.match(subtypeRgx);

    return {
        // If we somehow end up with nothing in match[2] or [4], use the input
        // as the name since 'name' can't be blank.
        name:   subtypeMatches[2] || subtypeMatches[4] || subtypeMatches[0],
        tree:   nullIfUndefined(subtypeMatches[1]),
        suffix: nullIfUndefined(subtypeMatches[3])
    };
}

function extractParams(d) {
    let params = [];

    for(let token of d[0]) {
        params.push(token[3]);
    }

    return params;
}

function extractParam(d) {
    return { attrib: d[0].value, value: d[2][0].value };
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "mediaType", "symbols": [(lexer.has("token") ? {type: "token"} : token), {"literal":"/"}, (lexer.has("token") ? {type: "token"} : token), "params"], "postprocess": extractMediaType},
    {"name": "params$ebnf$1", "symbols": []},
    {"name": "params$ebnf$1$subexpression$1", "symbols": ["_", {"literal":";"}, "_", "param"]},
    {"name": "params$ebnf$1", "symbols": ["params$ebnf$1", "params$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "params", "symbols": ["params$ebnf$1"], "postprocess": extractParams},
    {"name": "param$subexpression$1", "symbols": [(lexer.has("token") ? {type: "token"} : token)]},
    {"name": "param$subexpression$1", "symbols": [(lexer.has("quotedString") ? {type: "quotedString"} : quotedString)]},
    {"name": "param", "symbols": [(lexer.has("token") ? {type: "token"} : token), {"literal":"="}, "param$subexpression$1"], "postprocess": extractParam},
    {"name": "_", "symbols": [], "postprocess": nuller},
    {"name": "_", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": nuller}
]
  , ParserStart: "mediaType"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
