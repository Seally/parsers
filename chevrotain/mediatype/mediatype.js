const { lexer, parser, visitor } = require("./mediatype-visitor");
const ParseResult = require('../../all/mediatype/mediatype-parseresult').ParseResult;

module.exports.parse = function parse(input) {
    parser.input = lexer.tokenize(input).tokens;

    const cst = parser.mediaType();

    if(parser.errors.length > 0) {
        throw Error(
            "Sad sad panda, parsing errors detected!\n" +
            parser.errors[0].message
        )
    }

    return new ParseResult(input, visitor.visit(cst));
};