var async = require("async");
var module = require("./index.js");
var fs = require("fs");

var cases = [
	["data/test.svg", "data/test.png", "data/test0.png", "data/test1.png"],
	["data/face.svg", "data/face.png", "data/face0.png", "data/face1.png"],
	["data/print.svg", "data/print.png", "data/print0.png", "data/print1.png"],
];

async.each(
	cases,
	function(cas, next) {
		var input = fs.readFileSync(cas[0]);
		var expected = fs.readFileSync(cas[1]);
		var expected0 = fs.readFileSync(cas[2]);
		var expected1 = fs.readFileSync(cas[3]);
		module.capturePng(input, "svg", 400, 300, function(err, result) {
			if (result.equals(expected)) {
				console.log("PASS (png): " + cas[0]);
			} else {
				console.log("FAIL (png): " + cas[0]);
				console.log("Output saved in debug.png");
				fs.writeFileSync("debug.png", result);
				return next(new Error());
			}
		});
		module.capturePngPages(input, "svg", 400, 200, 2, function(err, pages) {
			if (pages[0].equals(expected0)) {
				console.log("PASS (page 0): " + cas[0]);
			} else {
				console.log("FAIL (page 0): " + cas[0]);
				console.log("Output saved in debug.png");
				fs.writeFileSync("debug.png", pages[0]);
				return next(new Error());
			}
			if (pages[1].equals(expected1)) {
				console.log("PASS (page 1): " + cas[0]);
			} else {
				console.log("FAIL (page 1): " + cas[0]);
				console.log("Output saved in debug.png");
				fs.writeFileSync("debug.png", pages[1]);
				return next(new Error());
			}
			next(null);
		});
	},
	function(err) {
		if (err) process.exit(1);
		else process.exit(0);
	}
);
