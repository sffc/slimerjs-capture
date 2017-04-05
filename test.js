var async = require("async");
var module = require("./index.js");
var fs = require("fs");
var path = require("path");

var cases = [
	["test.svg", "test.png", "test0.png", "test1.png"],
	["face.svg", "face.png", "face0.png", "face1.png"],
	["print.svg", "print.png", "print0.png", "print1.png"],
];

var inDir = "test_input";
var isWindows = (process.platform === "win32");
var outDir = isWindows ? "test_output_win" : "test_output_mac";
var generate = false;

function execCase(cas, next) {
	var input = fs.readFileSync(path.join(inDir, cas[0]));
	var expected = path.join(outDir, cas[1]);
	var expected0 = path.join(outDir, cas[2]);
	var expected1 = path.join(outDir, cas[3]);
	async[isWindows?"series":"parallel"]([
		function(_next) {
			module.capturePng(input, "svg", 400, 300, function(err, result) {
				if (err) return _next(err);
				if (generate) {
					fs.writeFileSync(expected, result);
					_next(null);
				} else if (result.equals(fs.readFileSync(expected))) {
					console.log("PASS (png): " + cas[0]);
					_next(null);
				} else {
					console.log("FAIL (png): " + cas[0]);
					console.log("Output saved in debug.png");
					fs.writeFileSync("debug.png", result);
					_next(new Error());
				}
			});
		},
		function(_next) {
			module.capturePngPages(input, "svg", 400, 200, 2, function(err, pages) {
				if (err) return _next(err);
				if (generate) {
					fs.writeFileSync(expected0, pages[0]);
				} else if (pages[0].equals(fs.readFileSync(expected0))) {
					console.log("PASS (page 0): " + cas[0]);
				} else {
					console.log("FAIL (page 0): " + cas[0]);
					console.log("Output saved in debug.png");
					fs.writeFileSync("debug.png", pages[0]);
					return _next(new Error());
				}
				if (generate) {
					fs.writeFileSync(expected1, pages[1]);
				} else if (pages[1].equals(fs.readFileSync(expected1))) {
					console.log("PASS (page 1): " + cas[0]);
				} else {
					console.log("FAIL (page 1): " + cas[0]);
					console.log("Output saved in debug.png");
					fs.writeFileSync("debug.png", pages[1]);
					return _next(new Error());
				}
				_next(null);
			});
		}
	], function(err, results) {
		next(err);
	});
}

async.series([
	function(next) {
		async[isWindows?"eachSeries":"each"](cases, execCase, next);
	},
	function(next) {
		var input = fs.readFileSync(path.join(inDir, "test.svg"));
		var old = process.env["SLIMERJSLAUNCHER"];
		process.env["SLIMERJSLAUNCHER"] = "/dev/null";
		module.capturePng(input, "svg", 400, 200, function(err){
			process.env["SLIMERJSLAUNCHER"] = old;
			if (!err) {
				console.log("FAIL: Did not receive error upon invalid SLIMERJSLAUNCHER config");
				return next(new Error());
			} else if (!/SLIMERJSLAUNCHER environment variable/.test(err.toString())) {
				console.log("FAIL: Error message does not contain output from SlimerJS");
				return next(new Error());
			} else {
				console.log("PASS: Received expected error message upon invalid SLIMERJSLAUNCHER config");
				return next(null);
			}
		});
	}
], function(err) {
	if (err) {
		console.log(err);
		process.exit(1);
	} else {
		process.exit(0);
	}
});


