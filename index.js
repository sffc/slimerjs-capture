var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var tmp = require("tmp");

var packageJson = require("slimerjs/package.json");
var binPath = path.join(path.dirname(require.resolve("slimerjs/package.json")), packageJson.bin.slimerjs);

function capture(input, extension, width, height, next) {
	tmp.file({ posfix: extension }, function(err, tmpFile, fd, cleanupCallback) {
		if (err) return next(err);
		fs.writeFile(tmpFile, input, function(err) {
			if (err) return next(err);
			var child = child_process.spawn(binPath, ["render.js", tmpFile, width, height], { cwd: __dirname });
			var chunks = [];
			child.stdout.on("data", function(chunk) {
				chunks.push(chunk);
			});
			child.stdout.on("end", function() {
				var buffer = Buffer.concat(chunks);
				cleanupCallback();
				next(null, buffer);
			});
		});
	});
}

module.exports = {
	capture: capture
};
