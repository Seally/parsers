const tokenNoPlusRgxStr = "[!#$%&'*\\-.^`|~\\w]+";
const tokenRgxStr       = "[!#$%&'*+\\-.^`|~\\w]+";
// This one is for extractSubtype() since I can't figure out for the life of
// me how to do (tree ".") subtype ("+" suffix) without ending up with an
// ambiguous grammar or a grammar that won't allow stuff like "vnd.vnd.mytype"
// (only the first "vnd." should count as part of the tree, but the lexer
// doesn't seem to agree).
//
// So I just let a regex take over here in post-processing (lexer itself can't
// use capture groups).
//
// I declared this in string form first to keep the result string "sane" (not
// too successful on that front) by indicating which portion is which.
//
// Match [0]: Entire string
//       [1]: Tree ("vnd", "prs", "x")
//       [2]: Subtype name (if we have a +suffix)
//       [3]: Suffix
//       [4]: Subtype name (no suffix)
const subtypeRgxStr = `^(?:((?:vnd|prs|x))\\.)?(?:(${tokenRgxStr})\\+(${tokenNoPlusRgxStr})|(${tokenRgxStr}))$`;

const regex1 = RegExp(subtypeRgxStr, 'i');

const tokenNoPlusRgxStr2 = /[!#$%&'*\-.^`|~\w]+/;
const tokenRgxStr2       = /[!#$%&'*+\-.^`|~\w]+/;

const subtypeRgxStr2 = `^(?:((?:vnd|prs|x))\\.)?(?:(${tokenRgxStr2.source})\\+(${tokenNoPlusRgxStr2.source})|(${tokenRgxStr2.source}))$`;
const regex2 = RegExp(subtypeRgxStr2, 'i');

console.log(regex1.source === regex2.source);
console.log(regex1.source);
console.log(regex2.source);
