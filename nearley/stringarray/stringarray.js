const nearley = require('nearley');
const grammar = require('./stringarray-parser');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const parserInitialState = parser.save();

exports.parse = function(input) {
    parser.restore(parserInitialState);

    parser.feed(input);

    if(parser.results && parser.results.length === 1) {
        return parser.results[0];
    }

    throw Error("Ambiguous parse.");
};