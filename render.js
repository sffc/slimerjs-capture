var page = require("webpage").create();
var system = require("system");

var filename = system.args[1];
var width = parseInt(system.args[2]);
var height = parseInt(system.args[3]);

phantom.outputEncoding = "binary";

var url = "file://" + filename;
page.open(url, function(success) {
	page.clipRect = { top: 0, left: 0, width: width, height: height };
	var bytes = page.renderBytes({ format: "png" });
	if (bytes) {
		system.stdout.write(bytes);
	}
	slimer.exit();
});

