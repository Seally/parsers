const chevrotain = require('chevrotain');

const createToken = chevrotain.createToken;

const varNameFirstCharRgx = /[^0-9\s()[\]{},:.]/;
const rawStringFirstCharRgx = /[^\s()[\]{},:.]/;

const hintsVarName = [];
const hintsRawString = [];

for(let i = 0; i < 65536; ++i) {
    if(varNameFirstCharRgx.test(String.fromCharCode(i))) {
        hintsVarName.push(i);
    }

    if(rawStringFirstCharRgx.test(String.fromCharCode(i))) {
        hintsRawString.push(i);
    }
}

const Whitespace = createToken({
    name: "Whitespace",
    pattern: /\s+/,
    group: chevrotain.Lexer.SKIPPED
});

const LParen = createToken({
    name: "LParen",
    pattern: "("
});

const RParen = createToken({
    name: "RParen",
    pattern: ")"
});

const LBrace = createToken({
    name: "LBrace",
    pattern: "{"
});

const RBrace = createToken({
    name: "RBrace",
    pattern: "}"
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

const Colon = createToken({
    name: "Colon",
    pattern: ":"
});

const Period = createToken({
    name: "Period",
    pattern: "."
});

const Number = createToken({
    name: "Number",
    pattern: /-?(?:\d|[1-9]\d+)(?:\.\d+)?(?:[eE][-+]?\d+)?\b/
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

const VarName = createToken({
    name: "VarName",
    pattern: RegExp(`${varNameFirstCharRgx.source}[^\\s()[\\]{},:.]*`),
    start_chars_hint: hintsVarName
});

const True = createToken({
    name: "True",
    pattern: "true",
    longer_alt: VarName
});

const False = createToken({
    name: "False",
    pattern: "false",
    longer_alt: VarName
});

const Null = createToken({
    name: "Null",
    pattern: "null",
    longer_alt: VarName
});

const Undefined = createToken({
    name: "Undefined",
    pattern: "undefined",
    longer_alt: VarName
});

const RawString = createToken({
    name: "RawString",
    pattern: RegExp(`${rawStringFirstCharRgx.source}+`),
    start_chars_hint: hintsRawString
});

const methodCallTokens = [
    Whitespace,
    LParen, RParen,
    LBrace, RBrace,
    LBracket, RBracket,
    Comma,
    Colon,
    Period,
    Number,
    SQString, DQString, BQString,
    True, False, Null, Undefined,
    VarName,
    RawString
];

// ---------- Parser ----------
class MethodCallParser extends chevrotain.Parser {
    constructor() {
        super(methodCallTokens);

        // Declare this here to avoid hidden class changes, which would
        // potentially slow the JS engine..
        this.c0 = undefined;
        this.c1 = undefined;

        const $ = this;

        $.RULE("methods", () => {
            $.MANY_SEP({
                SEP: Period,
                DEF: () => {
                    $.SUBRULE($.method);
                }
            });
        });

        $.RULE("method", () => {
            $.CONSUME(VarName);
            $.OPTION(() => {
                $.CONSUME(LParen);
                $.OPTION1(() => { $.SUBRULE($.args); });
                $.CONSUME(RParen);
            });
        });

        $.RULE("args", () => {
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE($.value);
                }
            });
        });

        $.RULE("value", () => {
            $.OR($.c0 || ($.c0 = [
                { ALT: () => { $.SUBRULE($.object) } },
                { ALT: () => { $.SUBRULE($.array) } },
                { ALT: () => { $.SUBRULE($.number) } },
                { ALT: () => { $.SUBRULE($.string) } },
            ]));
        });

        $.RULE("object", () => {
            $.CONSUME(LBrace);
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => { $.SUBRULE($.pair); }
            });
            $.CONSUME(RBrace);
        });

        $.RULE("array", () => {
            $.CONSUME(LBracket);
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE($.value);
                }
            });
            $.CONSUME(RBracket);
        });

        $.RULE("number", () => {
            $.CONSUME(Number);
        });

        $.RULE("string", () => {
            $.OR($.c1 || ($.c1 = [
                { ALT: () => { $.CONSUME(True); } },
                { ALT: () => { $.CONSUME(False); } },
                { ALT: () => { $.CONSUME(Null); } },
                { ALT: () => { $.CONSUME(Undefined); } },
                { ALT: () => { $.CONSUME(SQString); } },
                { ALT: () => { $.CONSUME(DQString); } },
                { ALT: () => { $.CONSUME(BQString); } },
                { ALT: () => { $.CONSUME(VarName); } },
                { ALT: () => { $.CONSUME(RawString); } }
            ]));
        });

        $.RULE("pair", () => {
            $.SUBRULE($.key);
            $.CONSUME(Colon);
            $.SUBRULE($.value);
        });

        $.RULE("key", () => {
            $.OR([
                { ALT: () => { $.SUBRULE($.number); } },
                { ALT: () => { $.SUBRULE($.string); } }
            ]);
        });

        $.performSelfAnalysis();
    }
}

exports.lexer = new chevrotain.Lexer(methodCallTokens, {
    ensureOptimizations: true
});
exports.parser = new MethodCallParser();
