var page = require("webpage").create();
var system = require("system");
var fs = require("fs");

var fileIn = system.args[1];
var fileOut = system.args[2];
var width = parseInt(system.args[3]);
var height = parseInt(system.args[4]);
var numPages = parseInt(system.args[5]);

phantom.outputEncoding = "binary";

var url = "file://" + fileIn;
page.open(url, function(success) {
	var fd = fs.open(fileOut, { mode: "wb" });
	for (var i=0; i<numPages; i++) {
		page.clipRect = { top: i*height, left: 0, width: width, height: height };
		var bytes = page.renderBytes({ format: "png" });
		if (bytes) {
			// It would be nicer to write a UInt32 here, but the API only lets you write strings
			var lenStr = bytes.length + "_";
			fd.write(lenStr);
			fd.write(bytes);
		}
	}
	fd.close();
	slimer.exit();
});

