slimerjs-capture
================

A thin wrapper around [SlimerJS](https://slimerjs.org) (headless Firefox/Gecko) that exposes an API to a Node.js application for rendering a web page as a png file.

## Installation

	$ npm install --save slimerjs-capture

## Usage

```js
const capturePng = require("slimerjs-capture").capturePng;

// ...
var buffer = fs.readFileSync("foo.html");
capturePng(buffer, "html", 640, 480, (err, result) => {
	if (err) return console.error(err);
	fs.writeFileSync("foo.png", result);
});
```

## API

**capturePng(buffer, extension, width, height, callback)**

- buffer => A Node.js Buffer containing the contents of the page to render
- extension => The file extension, like "html" or "svg"
- width, height => The width and height of the area to render, in pixels from the top left corner
- callback => Called with a possible error and the output PNG as a Node.js Buffer

**capturePngPages(buffer, extension, width, height, numPages, callback)**

- buffer => A Node.js Buffer containing the contents of the page to render
- extension => The file extension, like "html" or "svg"
- width, height => The width and height of the area to render, in pixels from the top left corner
- numPages => The number of pages to capture. Pages are rectangular, nonoverlapping regions captured starting from the top of the page.  For example, if height is 200, the first page will be from y=0 to y=200, and the second page will be from y=200 to y=400.
- callback => Called with a possible error and the output PNG as a Node.js Buffer

## Contributing and Future Work

PRs are welcome.  This module intentionally does not have any fancy build systems or anything.  It is intended to be run in Node without any preprocessing.  Use ES5 syntax and follow the code style in the files you are editing (tab indentation and soft wraps).  Run `npm test` and add new test cases for the feature you are contributing.

It would be easy to make this module support JPG or PDF output.  See [SlimerJS webpage doc page](https://docs.slimerjs.org/current/api/webpage.html#render-filename-options).  I just didn't have the personal need when I made this module to support other output types.  A PR is welcome.
