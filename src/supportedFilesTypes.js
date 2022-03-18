// eslint-disable-next-line no-unused-vars
const vscode = require('vscode');

/** @type {vscode.DocumentSelector[]} */
const SUPPORTED_FILES_TYPES = [
	// { scheme: 'file', language: 'coffeescript' },
	{ scheme: 'file', language: 'css' },
	{ scheme: 'file', language: 'html' },
	// { scheme: 'file', language: 'javascript' },
	// { scheme: 'file', language: 'javascriptreact' },
	// { scheme: 'file', language: 'less' },
	// { scheme: 'file', language: 'markdown' },
	// { scheme: 'file', language: 'php' },
	// { scheme: 'file', language: 'plaintext' },
	// { scheme: 'file', language: 'sass' },
	// { scheme: 'file', language: 'scss' },
	// { scheme: 'file', language: 'stylus' },
	// { scheme: 'file', language: 'typescript' },
	// { scheme: 'file', language: 'typescriptreact' },
	// { scheme: 'file', language: 'vue' },
	// { scheme: 'file', language: 'vue-html' },
	// { scheme: 'file', language: 'xml' },
	// { scheme: 'file', language: 'xsl' },
];

module.exports = SUPPORTED_FILES_TYPES;
