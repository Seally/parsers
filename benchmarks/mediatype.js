const fs = require('fs');
const path = require('path');

const Benchmark = require('benchmark');
const DOMParser = require('xmldom').DOMParser;

const MediaType = {
    chevrotain: {
        parse: require('../chevrotain/mediatype/mediatype').parse
    },
    nearley: {
        parse: require('../nearley/mediatype/mediatype').parse
    }
};

// readFileSync() resolves to the path where the script is invoked, not the
// script's actual location.
const srcPath = path.resolve(__dirname, "./media-types.xml");
const doc = new DOMParser().parseFromString(fs.readFileSync(srcPath).toString());

const mediaTypes = [];
let files = doc.getElementsByTagName("file");

for(let i = 0; i < files.length; ++i) {
    mediaTypes.push(files[i].childNodes[0].nodeValue);
}

const suite = new Benchmark.Suite("Mediatype Parser");

suite.add("Chevrotain Test", function() {
    for(let mediaType of mediaTypes) {
        MediaType.chevrotain.parse(mediaType);
    }
}).add("Nearley Test", function () {
    for(let mediaType of mediaTypes) {
        MediaType.nearley.parse(mediaType);
    }
}).on("complete", function() {
    console.log("name\t\tmean");
    for(let i = 0; i < this.length; ++i) {
        let bench = this[i];
        console.log(`${bench.name}\t${bench.stats.mean}`);
    }
}).run();