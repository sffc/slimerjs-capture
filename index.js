var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var tmp = require("tmp");
var fs = require("fs");

var binDir = path.join(path.dirname(require.resolve("slimerjs/package.json")), "src");

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
			runSlimerJS(args, function(err) {
				if (err) return next(err);
				fs.readFile(tmp2, function(err, buffer) {
					if (err) return next(err);
					var offset = 0;
					var pages = [];
					for (var i=0; i<numPages; i++) {
						var upos = offset;
						for (; buffer[upos] !== 0x5f; upos++); // underscore
						var len = parseInt(buffer.slice(offset, offset + upos).toString("ascii"));
						offset = upos + 1;
						var page = buffer.slice(offset, offset + len);
						offset += len;
						pages.push(page);
					}
					next(null, pages);
				});
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

function runSlimerJS(args, next) {
	var child;
	if (process.platform === "win32") {
		// Workaround from https://github.com/nodejs/node/issues/7367
		child = child_process.spawn("slimerjs.bat", args, {
			shell: true,
			stdio: "inherit",
			cwd: binDir
		});
	} else {
		child = child_process.spawn("slimerjs", args, {
			stdio: "inherit",
			cwd: binDir
		});
	}
	child.on("error", function(err) {
		next(err);
	});
	child.on("exit", function(code){
		next(null);
	});
}

module.exports = {
	capturePng: capturePng,
	capturePngPages: capturePngPages
};
