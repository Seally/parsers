class ParseResult {
    /**
     * Constructs a ParseResult object, effectively wrapping it and
     * providing additional functions.
     *
     * The following properties are read and translated (to properties with
     * the same name) as properties of ParseResult:
     * * `input`    - `<string>`
     * * `noParams` - `<string>`
     * * `type`     - `<string>`
     * * `subtype`  - `{ name: <string>, tree: <string>, suffix: <string> }`
     * * `params`   - `[ { attrib: <string>, value: <string> }, ... ]`
     *
     * @param input {String}       - Parser input string. In most cases this
     *                               value needs to be called from the method
     *                               using the parser, instead of being part of
     *                               the parse result object.
     * @param parseResult {Object} - Parameters for properties. This is usually
     *                               the parse result object from the parser or
     *                               visitor.
     */
    constructor(input, parseResult) {
        this.input    = input;
        this.noParams = parseResult.noParams;
        this.type     = parseResult.type;
        this.subtype  = parseResult.subtype;
        this.params   = parseResult.params;
    }

    /**
     * Checks if the media type can be interpreted as `target`. Same result
     * as `isLikelyA(target)`, except that if `target === "text"` it will
     * return the result for `isPlainText(target)`.
     *
     * This is the most "forgiving" of the media type test functions. This
     * should be used if `target` is only known during runtime (like, say,
     * provided as user input). Otherwise, consider using `isA()`,
     * `isLikelyA()`, or `isPlainText()` instead.
     *
     * @param target {string} The target is checked against this. Check is
     *                        _case-sensitive_ and input is expected to be
     *                        in lowercase.
     * @returns {boolean} Whether this media type can be interpreted as
     *                    `target` (heuristic-based). `false` is also returned
     *                    if the input is "invalid" somehow (blank, consists of
     *                    only whitespace, not a string etc.)
     */
    canBeInterpretedAs(target) {
        // Input smell test:
        // * If target is not a string, return false.
        // * If target is a string consists of nothing else but whitespace
        //   (/\S/.test() returns false), also return false.
        if(typeof target !== 'string' || !/\S/.test(target)) {
            return false;
        }

        // Don't be overly smart and use regex here, else the input
        // might need escaping (unless you thought of that too, just
        // to end up with a bulkier solution than what is used
        // here :P).
        return this._isLikelyA(target)
            || (target === 'text' && this.isPlainText());
    }

    /**
     * Checks if the media type matches `target`. This checks `target`
     * only against the name and the suffix of the media type.
     *
     * This should be used when `target` is a well-established registered
     * IANA media type (you do not expect 'x-<subtype>' form to occur).
     *
     * This is the strictest of the media type test functions.
     *
     * @param target {string} The target is checked against this. Check is
     *                        _case-sensitive_ and input is expected to be
     *                        in lowercase.
     * @returns {boolean} Whether this media type can be interpreted as
     *                    `target` (heuristic-based). `false` is also returned
     *                    if the input is "invalid" somehow (blank, consists of
     *                    only whitespace, not a string etc.)
     */
    isA(target) {
        // Input smell test:
        // * If target is not a string, return false.
        // * If target is a string consists of nothing else but whitespace
        //   (/\S/.test() returns false), also return false.
        if(typeof target !== 'string' || !/\S/.test(target)) {
            return false;
        }

        return this._isA(target);
    }

    /**
     * Like the non-underscored public method {@link isA}, but w/o the
     * smell test for internal calls (so it won't go through the smell test
     * twice).
     *
     * @see isA
     * @param target {string}
     * @returns {boolean}
     * @private
     */
    _isA(target) {
        // Don't be overly smart and use regex here, else the input
        // might need escaping (unless you thought of that too, just
        // to end up with a bulkier solution than what is used
        // here :P).
        return this.subtype.name === target
            || this.subtype.suffix === target;
    }

    /**
     * Checks if the media type matches `target`. Same as `isA()`, but
     * also checks against `x-<target>` as well.
     *
     * This should be used when `target` is likely to appear in
     * `x-<target>` form as well as plain `<target>`.
     *
     * @param target {string} The target is checked against this. Check is
     *                        _case-sensitive_ and input is expected to be
     *                        in lowercase.
     * @returns {boolean} Whether this media type can be interpreted as
     *                    `target` (heuristic-based). `false` is also returned
     *                    if the input is "invalid" somehow (blank, consists of
     *                    only whitespace, not a string etc.)
     */
    isLikelyA(target) {
        // Input smell test:
        // * If target is not a string, return false.
        // * If target is a string consists of nothing else but whitespace
        //   (/\S/.test() returns false), also return false.
        if(typeof target !== 'string' || !/\S/.test(target)) {
            return false;
        }

        return this._isLikelyA(target);
    }

    /**
     * Like the non-underscored public method {@link isLikelyA}, but w/o the
     * smell test for internal calls (so it won't go through the smell test
     * twice).
     *
     * @see isLikelyA
     * @param target {string}
     * @returns {boolean}
     * @private
     */
    _isLikelyA(target) {
        // Don't be overly smart and use regex here, else the input
        // might need escaping (unless you thought of that too, just
        // to end up with a bulkier solution than what is used
        // here :P).
        return this.subtype.name === `x-${target}`
            || this._isA(target);
    }

    /**
     * This checks if the target can be interpreted as plain text.
     *
     * This mainly checks if the media type's `type` is `text`, but it also
     * has overloads for some\* common plain text types that may not have
     * the type "text".
     *
     * \*These currently are: javascript, json, yaml
     *
     * @returns {boolean} `true` if the media type indicates the content is
     *                    in plaintext.
     */
    isPlainText() {
        return this.type === 'text'
            // Some common plain text types that aren't under type "text".
            || this.isA('javascript')
            || this.isA('json')
            || this.isLikelyA('yaml');
    }
}

exports.ParseResult = ParseResult;