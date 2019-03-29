const chevrotain = require('chevrotain');

const createToken = chevrotain.createToken;

const rawStringFirstCharRgx = /(?:\\.|[^,[\]])/;

const hintsRawString = [];

for(let i = 0; i < 65536; ++i) {
    // Should be true for '\' anyway, so the fact that this matches a
    // two-character string as long as it's preceded by a backslash shouldn't
    // matter.
    if(rawStringFirstCharRgx.test(String.fromCharCode(i))) {
        hintsRawString.push(i);
    }
}

const Whitespace = createToken({
    name: "Whitespace",
    pattern: /\s+/,
    group: chevrotain.Lexer.SKIPPED
});

const LBracket = createToken({
    name: "LBracket",
    pattern: "["
});

const RBracket = createToken({
    name: "RBracket",
    pattern: "]"
});

const Comma = createToken({
    name: "Comma",
    pattern: ","
});

const SQString = createToken({
    name: "SQString",
    pattern: /'(?:\\.|[^'])*'/
});

const DQString = createToken({
    name: "DQString",
    pattern: /"(?:\\.|[^"])*"/
});

const BQString = createToken({
    name: "BQString",
    pattern: /`(?:\\.|[^`])*`/
});

const RawString = createToken({
    name: "RawString",
    pattern: RegExp(`${rawStringFirstCharRgx.source}*(?:\\\\.|[^\\s\\],])`),
    start_chars_hint: hintsRawString
});

const stringArrayTokens = [
    Whitespace,
    LBracket, RBracket,
    Comma,
    SQString, DQString, BQString,
    RawString
];

// ---------- Parser ----------
class StringArrayParser extends chevrotain.Parser {
    constructor() {
        super(stringArrayTokens);

        // Declare this here to avoid hidden class changes, which would
        // potentially slow the JS engine..
        this.c0 = undefined;

        const $ = this;

        $.RULE("array", () => {
            $.OPTION(() => {
                $.OR([
                    { ALT: () => {
                        $.CONSUME(LBracket);
                        $.SUBRULE($.arrayItems);
                        $.CONSUME(RBracket);
                    } },
                    { ALT: () => {
                        $.OPTION1(() => { $.SUBRULE1($.arrayItems); } );
                    }}
                ]);
            });
        });

        $.RULE("arrayItems", () => {
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE($.string);
                }
            });
        });

        $.RULE("string", () => {
            $.OR($.c0 || ($.c0 = [
                { ALT: () => { $.CONSUME(SQString);  } },
                { ALT: () => { $.CONSUME(DQString);  } },
                { ALT: () => { $.CONSUME(BQString);  } },
                { ALT: () => { $.CONSUME(RawString); } }
            ]));
        });

        $.performSelfAnalysis();
    }
}

exports.lexer = new chevrotain.Lexer(stringArrayTokens, {
    ensureOptimizations: true
});
exports.parser = new StringArrayParser();
