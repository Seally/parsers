const {
    tokenRgx,
    tokenNoPlusRgx,
    lexer,
    parser
} = require('./mediatype-parser');

// ---------- Interpreter ----------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

const subtypeRgx = RegExp(`^(?:((?:vnd|prs|x))\\.)?(?:(${tokenRgx.source})\\+(${tokenNoPlusRgx.source})|(${tokenRgx.source}))$`, 'i');

class MediaTypeVisitor extends BaseCstVisitor {
    constructor() {
        super();
        this.validateVisitor();
    }

    mediaType(ctx) {
        const subtypeMatches = ctx.subtype[0].image.match(subtypeRgx);

        const subtype = {
            // If we somehow end up with nothing in match[2] or [4], use the input
            // as the name since 'name' can't be blank.
            name:   subtypeMatches[2] || subtypeMatches[4] || subtypeMatches[0],
            tree:   subtypeMatches[1] || null,
            suffix: subtypeMatches[3] || null
        };

        return {
            noParams: ctx.type[0].image + ctx.Slash[0].image + ctx.subtype[0].image,
            type:     ctx.type[0].image,
            subtype:  subtype,
            params:   this.visit(ctx.params)
        };
    }

    params(ctx) {
        if(!ctx.param) {
            return [];
        }

        return ctx.param.map((item) => this.visit(item));
    }

    param(ctx) {
        return {
            attrib: ctx.attrib[0].image,
            value: ctx.value ? ctx.value[0].image : ctx.quotedValue[0].image.slice(1, -1)
        };
    }
}

exports.lexer = lexer;
exports.parser = parser;
exports.visitor = new MediaTypeVisitor();