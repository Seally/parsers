const {
    lexer,
    parser
} = require('./stringarray-parser');

// ---------- Interpreter ----------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class StringArrayVisitor extends BaseCstVisitor {
    constructor() {
        super();
        this.validateVisitor();
    }

    array(ctx) {
        if(ctx.arrayItems) {
            return this.visit(ctx.arrayItems);
        }

        return [];
    }

    arrayItems(ctx) {
        if(ctx.string) {
            return ctx.string.map((item) => this.visit(item));
        }

        return [];
    }

    string(ctx) {
        let qString = ctx.SQString || ctx.DQString || ctx.BQString;

        if(qString) {
            return qString[0].image.slice(1, -1).replace(/\\(.)/gm, "$1");
        }

        return ctx.RawString[0].image.replace(/\\(.)/gm, "$1");
    }
}

exports.lexer = lexer;
exports.parser = parser;
exports.visitor = new StringArrayVisitor();
