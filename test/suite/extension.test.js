const { before, after } = require('mocha');
const { window } = require('vscode');
const floatSuite = require('./suites/float.js');
const clearSuite = require('./suites/clear.js');
const textAlignSuite = require('./suites/text-align.js');
const insetSuite = require('./suites/inset.js');
const marginSuite = require('./suites/margin.js');
const paddingSuite = require('./suites/padding.js');
const sizeSuite = require('./suites/size.js');
const borderSuite = require('./suites/border.js');

// https://stackoverflow.com/a/57670483/2344083
// https://github.com/microsoft/vscode/blob/main/extensions/vscode-api-tests/src/singlefolder-tests/editor.test.ts
// https://stackoverflow.com/questions/55456193/testing-a-vscode-extension-that-involves-opening-a-folder-workspace
// https://stackoverflow.com/questions/41126289/vscode-extension-write-and-open-file
suite('Extension Test Suite', () => {
	before(async () => {
		console.info('Start all tests.');

		window.showInformationMessage('Start all tests.');
	});

	floatSuite();
	clearSuite();
	textAlignSuite();
	insetSuite();
	marginSuite();
	paddingSuite();
	sizeSuite();
	borderSuite();

	after(async () => {
		window.showInformationMessage('End all tests.');
		console.info('End all tests.');
	});
});
