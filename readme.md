General Usage
=============

Import `<parser_name>.js` (like `mediatype.js`, `methodcall.js`) in your actual
JavaScript. The method `parse()` is used for the parser. Usually you should not
invoke the parser directly.

Both the Chevrotain and the Nearley versions _should_ produce the same output 
for every valid input. The Chevrotain version is (probably) faster than Nearley
version, but you may want to benchmark it yourself to be sure. Benchmarks are 
available for _some_ parsers, but most don't have one (write one for me :P).

For the Chevrotain parsers, these files are required:
* `/chevrotain/<parser_name>/<parser_name>.js`
* `/chevrotain/<parser_name>/<parser_name>-parser.js`
* `/chevrotain/<parser_name>/<parser_name>-visitor.js`
* `/all/<parser_name>/**` (if any)

For Nearley parsers, these files are required:
* `/nearley/<parser_name>/<parser_name>.js`
* `/nearley/<parser_name>/<parser_name>-parser.js`
* `/all/<parser_name>/**` (if any)
* The Nearley grammar file (`*.ne`) is not actually code (on its own), but may
  be easier to read than the generated `.js` file.


**Usage Example**
```javascript
const { parse } = require("mediatype.js");

let input = "text/vnd.tiddlywiki";
let parseResult = parse(input);
console.log(parseResult);
```

Media Type Parser
-----------------

The media type parser reads a media type string (_e.g._ `text/html`, 
`application/vnd.myapp.notes+json`, `text/html; charset=UTF-8`) and spits out a 
JavaScript object that may be more convenient to parse.

**Examples**

*Input:* `text/html; charset=UTF-8`
```
{
  // Note that input is added by the parse() function. 
  // It will not be present if you use the parser directly.
  input: "text/html; charset=UTF-8",
  noParams: "text/html",
  type: "text",
  subtype: {
      name: "html",
      // When the following values are not present in the media type, it will
      // be set to null. This is to simplify
      tree: null,
      suffix: null
  },
  params: [
      { attrib: "charset", value: "UTF-8" }
  ]
};
```

*Input:* `application/vnd.myapp.notes+json`
```
{
  input: "application/vnd.myapp.notes+json",
  noParams: "application/vnd.myapp.notes+json",
  type: "application",
  subtype: {
      name: "myapp.notes",
      tree: "vnd",
      suffix: "json"
  },
  // params is null instead of empty so you can do
  // if(result.params) when it's empty.
  //
  // If you need something different whenever there are no 
  // media type parameters, like an empty array, pass that
  // as the second argument for the parse function.
  params: []
};
```

Note that the parser object also adds some special methods to the result object. 
These methods are:

* `isA(target)`: Checks target against subtype and suffix fields.
* `isLikelyA(target)`: Like `isA()`, but also checks against the `x-<target>` 
                       variant.
* `isPlainText()`: Checks if the media type is a plain text type (has `type` 
                   of `"text"`). Also counts some other non-"text" media types
                   as plain text (like JavaScript and JSON).
* `canBeInterpretedAs(target)`: Basically `isLikelyA()` + `isPlainText()`.
                                Should only be used for dynamic inputs (like 
                                those provided by the user) so that it can read 
                                like `mediaType.canBeInterpreted("text")` or
                                `mediaType.canBeInterpreted("json")`. 
                                Otherwise prefer the simpler functions.

Method Call Parser
------------------

The method call parser (designed mainly for JavaScript) accepts "method calls", 
optionally with arguments. The consumer of the parser can then use the 
information to perform method calls.

Arguments are in JSON-style, with the following additions:
* Strings without whitespace or "special characters" (`()[]{},:.`) can be 
  provided unquoted. Note that there's no "escape" character defined for 
  unquoted strings, so anything that it can't handle will need to be provided in 
  a quoted string. 
* Quoted strings can use single quotes or backquotes as well as the 
  JSON-standard double quotes to designate beginning and end.
* Object keys no longer need to be quoted (although with the same caveats as 
  unquoted strings).
* Inside quoted strings, the backslash "\\" is used as an escape character. The 
  parser interprets anything that follows this symbol to be interpreted 
  literally. Notably, "\n" means literal "n" (not newline) and "\\\\" means 
  literal backslash. Note that the JavaScript string parser may "eat" one of the 
  backslashes, so literal backslash may need to be entered as "\\\\\\\\" for the 
  parser to see two backslashes. Special characters like newline rely on the 
  string parser to recognize it. The method call parser will not perform the 
  conversion.
* Unquoted strings with the form `true`, `false`, `undefined`, `null`, or a 
  number will be interpreted as that value instead of a string. If you need it 
  in string form, you should enclose it within quotes.

Other things:
* Methods are still separated by a period. There can be whitespace on either 
  side of the period.
* Method parentheses are optional. A method with no parentheses given is 
  interpreted like a method with a pair of empty parentheses.
* Methods with no arguments will be returned as an empty array `[]`.

**Examples**

*Input:* (blank)

*Output:*
```
[]
```

*Input:* `capitalize`

*Output:*
```
[
    { 
        name: "capitalize",
        args: []
    }
]
```

*Input:* `capitalize(true, false)`

*Output:*
```
[
    { 
        name: "capitalize",
        args: [ true, false ]
    }
]
```

*Input:* `foo.bar([ 1, 2, 3 ], baz) . bash()`

*Output:*
```
[
    { 
        name: "foo",
        args: []
    }, {
        name: "bar",
        args: [ [ 1, 2, 3 ], "baz" ]
    }, {
        name: "bash",
        args: []
    }
]
```

String Array Parser
-------------------

The simplest parser here (at a glance). Reads a string and attempts to convert 
it into an array of strings. May or may not be surrounded by `[]`. Strings must
be separated by a comma ",". Double quotes, single quotes, and backquotes are
all acceptable quote types.

*Input:* `[ foo bar, baz, is great , since I don't have to come up with weird names ]`

*Output:*
```
[ "foo bar", "baz", "is great", "since I don't have to come up with weird names" ]
```

*Input:* `foobar 2000, is a , great media player`

*Output:*
```
[ "foobar 2000", "is a", "great media player" ]
```

*Input:* `How to, fake a comma., Method 1, \,, Method 2, ","`

*Output:*
```
[ "How to", "fake a comma.", "Method 1", ",", "Method 2", "," ]
```
**Note:** Make sure your backslash is not eaten by JavaScript. You may need 
          double backslashes when you actually type in that input string. 