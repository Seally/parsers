const {
    lexer,
    parser
} = require('./methodcall-parser');

// ---------- Interpreter ----------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class MethodCallVisitor extends BaseCstVisitor {
    constructor() {
        super();
        this.validateVisitor();
    }

    methods(ctx) {
        if(ctx.method) {
            return ctx.method.map((item) => this.visit(item));
        }

        return [];
    }

    method(ctx) {
        return {
            name: ctx.VarName[0].image,
            args: ctx.args ? this.visit(ctx.args) : null
        };
    }

    args(ctx) {
        if(ctx.value) {
            return ctx.value.map((item) => this.visit(item));
        }

        return null;
    }

    value(ctx) {
        if(ctx.object) return this.visit(ctx.object);
        if(ctx.array) return this.visit(ctx.array);
        if(ctx.number) return this.visit(ctx.number);

        return this.visit(ctx.string);
    }

    object(ctx) {
        let result = {};

        if(ctx.pair) {
            let pair;

            for(let i = 0; i < ctx.pair.length; ++i) {
                pair = this.visit(ctx.pair);

                result[pair.key] = pair.value;
            }
        }

        return result;
    }

    array(ctx) {
        if(ctx.value) {
            return ctx.value.map((item) => this.visit(item));
        }

        return [];
    }

    number(ctx) {
        return parseFloat(ctx.Number[0].image);
    }

    string(ctx) {
        if(ctx.True) return true;
        if(ctx.False) return false;
        if(ctx.Null) return null;
        if(ctx.Undefined) return undefined;

        let qString = ctx.SQString || ctx.DQString || ctx.BQString;

        if(qString) {
            return qString[0].image.slice(1, -1).replace(/\\(.)/gm, "$1");
        }

        if(ctx.VarName) {
            return ctx.VarName[0].image;
        }

        return ctx.RawString[0].image;
    }

    pair(ctx) {
        return {
            key: this.visit(ctx.key),
            value: this.visit(ctx.value)
        };
    }

    key(ctx) {
        if(ctx.number) return this.visit(ctx.number);

        return this.visit(ctx.string);
    }
}

exports.lexer = lexer;
exports.parser = parser;
exports.visitor = new MethodCallVisitor();