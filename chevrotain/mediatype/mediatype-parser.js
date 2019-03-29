const chevrotain = require('chevrotain');

const tokenNoPlusRgx = /[!#$%&'*\-.^`|~\w]+/;
const tokenRgx       = /[!#$%&'*+\-.^`|~\w]+/;

const createToken = chevrotain.createToken;

const Slash = createToken({
    name: "Slash",
    pattern: "/"
});

const Spaces = createToken({
    name: "Spaces",
    pattern: /[ \t]+/
});

const Semicolon = createToken({
    name: "Semicolon",
    pattern: ";"
});

const Equals = createToken({
    name: "Equals",
    pattern: "="
});

const Token = createToken({
    name: "Token",
    pattern: tokenRgx
});

const QuotedString = createToken({
    name: "QuotedString",
    pattern: /"(?:\\[\t !-~\u0080-\u00ff]|[\t !#-[\]-~\u0080-\u00ff])*"/
});

const mediaTypeTokens = [
    Slash,
    Spaces,
    Semicolon,
    Equals,
    Token,
    QuotedString
];

function autoLabelToken(token) {
    token.LABEL = `'${token.PATTERN.source || token.PATTERN}'`;
}

autoLabelToken(Slash);
autoLabelToken(Spaces);
autoLabelToken(Semicolon);
autoLabelToken(Equals);

// ---------- Parser ----------
class MediaTypeParser extends chevrotain.Parser {
    constructor() {
        super(mediaTypeTokens);

        const $ = this;

        $.RULE("mediaType", () => {
            $.CONSUME(Token, { LABEL: "type" });
            $.CONSUME(Slash);
            $.CONSUME1(Token, { LABEL: "subtype" });
            $.SUBRULE($.params);
        });

        $.RULE("params", () => {
            $.MANY(() => {
                $.OPTION(() => {
                    $.CONSUME(Spaces);
                });
                $.CONSUME(Semicolon);
                $.OPTION1(() => {
                    $.CONSUME1(Spaces);
                });
                $.SUBRULE($.param);
            });
        });

        $.RULE("param", () => {
            $.CONSUME(Token, { LABEL: "attrib" });
            $.CONSUME(Equals);
            $.OR([
                { ALT: () => {
                    $.CONSUME1(Token, { LABEL: "value" });
                } },
                { ALT: () => {
                    $.CONSUME1(QuotedString, { LABEL: "quotedValue" });
                } }
            ]);
        });

        $.performSelfAnalysis();
    }
}

exports.tokenNoPlusRgx = tokenNoPlusRgx;
exports.tokenRgx = tokenRgx;
exports.lexer = new chevrotain.Lexer(mediaTypeTokens, {
    positionTracking: "onlyOffset",
    ensureOptimizations: true
});
exports.parser = new MediaTypeParser();
