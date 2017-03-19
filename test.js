var async = require("async");
var module = require(".");
var fs = require("fs");

var cases = [
	["data/test.svg", "data/test.png"],
	["data/face.svg", "data/face.png"],
	["data/print.svg", "data/print.png"],
];

async.eachSeries(
	cases,
	function(cas, next) {
		var input = fs.readFileSync(cas[0]);
		var expected = fs.readFileSync(cas[1]);
		module.capture(input, "svg", 400, 300, (err, result) => {
			if (result.equals(expected)) {
				console.log("PASS: " + cas[0]);
				next(null);
			} else {
				console.log("FAIL: " + cas[0]);
				console.log("Output saved in debug.png");
				fs.writeFileSync("debug.png", result);
				next(new Error());
			}
		});
	},
	function(err) {
		if (err) process.exit(1);
		else process.exit(0);
	}
);
