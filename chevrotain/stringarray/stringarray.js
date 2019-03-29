const { lexer, parser, visitor } = require("./stringarray-visitor");

module.exports.parse = function parse(input) {
    parser.input = lexer.tokenize(input).tokens;

    const cst = parser.array();

    if(parser.errors.length > 0) {
        throw Error(
            "Sad sad panda, parsing errors detected!\n" +
            parser.errors[0].message
        )
    }

    return visitor.visit(cst);
};