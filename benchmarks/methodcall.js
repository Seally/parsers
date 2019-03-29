const fs = require('fs');

const Benchmark = require('benchmark');
const xpath = require('xpath');
const DOMParser = require('xmldom').DOMParser;

const MethodCall = {
    chevrotain: {
        parse: require('../chevrotain/methodcall/methodcall').parse
    },
    nearley: {
        parse: require('../nearley/methodcall/methodcall').parse
    }
};

// generate test strings
// # of chars where we want 50% of all test strings to at least have.
const methodNameHalfPoint = 10;
// # of chained methods we want 50% of all test strings to at least have.
const methodChainHalfPoint = 5;

/**
 * Chance that the next character in the test string should be generated.
 *
 * Explanation:
 * Case: `atLeastOne = true` (r = chance/output)
 *
 * length=0:         r^0         (100%)
 *       =1:         r^1
 *       ...
 *       =halfPoint: r^halfPoint (50%)
 *
 * So: solve r^halfPoint        = 0.5
 *           r                  = halfPoint root of 0.5
 *
 * Case: `atLeastOne = false` (r = chance/output)
 *
 * length=0:         r^1
 *       =1:         r^2
 *       ...
 *       =halfPoint: r^(halfPoint + 1) (50%)
 *
 * So: solve r^(halfPoint + 1 ) = 0.5
 *           r                  = (halfPoint + 1) root of 0.5
 *
 * @param halfPoint
 * @param atLeastOne
 */
function getChanceForNextGeneration(halfPoint, atLeastOne = true) {
    if(atLeastOne) {
        return Math.pow(0.5, 1 / halfPoint);
    }

    return Math.pow(0.5, 1 / (halfPoint + 1));
}

const methodNameChance = getChanceForNextGeneration(methodNameHalfPoint);
const methodChainChance = getChanceForNextGeneration(methodChainHalfPoint, false);

/**
 * From r^n = threshold
 *
 * n * log(r) = log(threshold)
 * n          = log(threshold) / log(r)
 *
 * @param chance
 * @param threshold
 * @returns {number}
 */
function getMaxPoint(chance, threshold = 0.01) {
    return Math.log(threshold) / Math.log(chance);
}

const suite = new Benchmark.Suite("Mediatype Parser");

suite.add("Chevrotain Test", function() {
    // for(let mediaType of mediaTypes) {
    //     MethodCall.chevrotain.parse(mediaType);
    // }
}).add("Nearley Test", function () {
    // for(let mediaType of mediaTypes) {
    //     MethodCall.nearley.parse(mediaType);
    // }
}).on("complete", function() {
    console.log("name\t\tmean");
    for(let i = 0; i < this.length; ++i) {
        let bench = this[i];
        console.log(`${bench.name}\t${bench.stats.mean}`);
    }
}).run();