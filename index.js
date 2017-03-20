var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var tmp = require("tmp");
var fs = require("fs");

var packageJson = require("slimerjs/package.json");
var binPath = path.join(path.dirname(require.resolve("slimerjs/package.json")), packageJson.bin.slimerjs);

function capturePng(input, extension, width, height, next) {
	capturePngPages(input, extension, width, height, 1, function(err, pages) {
		next(err, pages && pages[0]);
	});
}

function capturePngPages(input, extension, width, height, numPages, next) {
	_makeTwoTmpFiles("svg", "out", function(err, tmp1, tmp2, cleanupCallback) {
		if (err) return next(err);
		fs.writeFile(tmp1, input, function(err) {
			if (err) return next(err);
			var args = [path.join(__dirname, "render.js"), tmp1, tmp2, width, height, numPages];
			var child = child_process.fork(binPath, args);
			child.on("exit", function() {
				fs.readFile(tmp2, function(err, buffer) {
					if (err) return next(err);
					var offset = 0;
					var pages = [];
					for (var i=0; i<numPages; i++) {
						var upos = buffer.indexOf(0x5f, offset); // underscore
						var len = parseInt(buffer.slice(offset, offset + upos).toString("ascii"));
						offset = upos + 1;
						var page = buffer.slice(offset, offset + len);
						offset += len;
						pages.push(page);
					}
					next(null, pages);
				});
			})
			child.on("error", function(err) {
				next(err);
			});
		});
	});
}

function _makeTwoTmpFiles(ext1, ext2, next) {
	tmp.file({ postfix: "."+ext1 }, function(err1, tmp1, fd1, cb1) {
		tmp.file({ postfix: "."+ext2 }, function(err2, tmp2, fd2, cb2) {
			next(err1 || err2, tmp1, tmp2, function() { cb1(); cb2(); });
		});
	});
}

module.exports = {
	capturePng: capturePng,
	capturePngPages: capturePngPages
};
