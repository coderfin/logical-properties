const vscode = require('vscode');
const ReplacePhysicalWithLogical = require('./ReplacePhysicalWithLogical');

/**
 * @typedef Diagnostic
 * @type {object}
 * @property {vscode.Range} range - the range.
 * @property {string} message - the message.
 * @property {string} code - the code.
 * @property {string} source - the source.
 * @property {object} term - the term.
 * @property {string} term.search - the search term.
 * @property {string} term.replacement - the replacement term.
 */

const TERMS = [
	// FLOAT
	{
		search: 'float: left', // TODO: space optional
		replacement: 'float: inline-start',
		isStatic: true,
	},
	{
		search: 'float: right',
		replacement: 'float: inline-end',
		isStatic: true,
	},
	{
		search: 'clear: left',
		replacement: 'clear: inline-start',
		isStatic: true,
	},
	{
		search: 'clear: right',
		replacement: 'clear: inline-end',
		isStatic: true,
	},
	// TEXT ALIGN
	{
		search: 'text-align: left',
		replacement: 'text-align: start',
		isStatic: true,
	},
	{
		search: 'text-align: right',
		replacement: 'text-align: end',
		isStatic: true,
	},
	// POSITION
	{
		search: `(?:;|^|\\s)(left: (.*?))(?:;|$|\\s)`,
		replacement: 'inset-inline-start: $2',
	},
	{
		search: `(?:;|^|\\s)(right: (.*?))(?:;|$|\\s)`,
		replacement: 'inset-inline-end: $2',
	},
	{
		search: `(?:;|^|\\s)(top: (.*?))(?:;|$|\\s)`,
		replacement: 'inset-block-start: $2',
	},
	{
		search: `(?:;|^|\\s)(bottom: (.*?))(?:;|$|\\s)`,
		replacement: 'inset-block-end: $2',
	},
	// DIMENSIONS
	{
		search: `(?:;|^|\\s)(width: (.*?))(?:;|$|\\s)`,
		replacement: 'inline-size: $2',
	},
	{
		search: `(?:;|^|\\s)(height: (.*?))(?:;|$|\\s)`,
		replacement: 'block-size: $2',
	},
	{
		search: `(?:;|^|\\s)(min-width: (.*?))(?:;|$|\\s)`,
		replacement: 'min-inline-size: $2',
	},
	{
		search: `(?:;|^|\\s)(min-height: (.*?))(?:;|$|\\s)`,
		replacement: 'min-block-size: $2',
	},
	{
		search: `(?:;|^|\\s)(max-width: (.*?))(?:;|$|\\s)`,
		replacement: 'max-inline-size: $2',
	},
	{
		search: `(?:;|^|\\s)(max-height: (.*?))(?:;|$|\\s)`,
		replacement: 'max-block-size: $2',
	},
	// MARGINS
	{
		search: `(?:;|^|\\s)(margin-left: (.*?))(?:;|$|\\s)`,
		replacement: 'margin-inline-start: $2',
	},
	{
		search: `(?:;|^|\\s)(margin-right: (.*?))(?:;|$|\\s)`,
		replacement: 'margin-inline-end: $2',
	},
	{
		search: `(?:;|^|\\s)(margin-top: (.*?))(?:;|$|\\s)`,
		replacement: 'margin-block-start: $2',
	},
	{
		search: `(?:;|^|\\s)(margin-bottom: (.*?))(?:;|$|\\s)`,
		replacement: 'margin-block-end: $2',
	},
	// PADDINGS
	{
		search: `(?:;|^|\\s)(padding-left: (.*?))(?:;|$|\\s)`,
		replacement: 'padding-inline-start: $2',
	},
	{
		search: `(?:;|^|\\s)(padding-right: (.*?))(?:;|$|\\s)`,
		replacement: 'padding-inline-end: $2',
	},
	{
		search: `(?:;|^|\\s)(padding-top: (.*?))(?:;|$|\\s)`,
		replacement: 'padding-block-start: $2',
	},
	{
		search: `(?:;|^|\\s)(padding-bottom: (.*?))(?:;|$|\\s)`,
		replacement: 'padding-block-end: $2',
	},
	// BORDERS
	{
		search: `(?:;|^|\\s)(border-left-width: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-start-width: $2',
	},
	{
		search: `(?:;|^|\\s)(border-right-width: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-end-width: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top-width: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-start-width: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom-width: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-end-width: $2',
	},
	{
		search: `(?:;|^|\\s)(border-left-color: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-start-color: $2',
	},
	{
		search: `(?:;|^|\\s)(border-right-color: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-end-color: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top-color: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-start-color: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom-color: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-end-color: $2',
	},
	{
		search: `(?:;|^|\\s)(border-left-style: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-start-style: $2',
	},
	{
		search: `(?:;|^|\\s)(border-right-style: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-end-style: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top-style: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-start-style: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom-style: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-end-style: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top-left-radius: (.*?))(?:;|$|\\s)`,
		replacement: 'border-start-start-radius: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top-right-radius: (.*?))(?:;|$|\\s)`,
		replacement: 'border-end-start-radius: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom-left-radius: (.*?))(?:;|$|\\s)`,
		replacement: 'border-start-end-radius: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom-right-radius: (.*?))(?:;|$|\\s)`,
		replacement: 'border-end-end-radius: $2',
	},
	{
		search: `(?:;|^|\\s)(border-left: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-start: $2',
	},
	{
		search: `(?:;|^|\\s)(border-right: (.*?))(?:;|$|\\s)`,
		replacement: 'border-inline-end: $2',
	},
	{
		search: `(?:;|^|\\s)(border-top: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-start: $2',
	},
	{
		search: `(?:;|^|\\s)(border-bottom: (.*?))(?:;|$|\\s)`,
		replacement: 'border-block-end: $2',
	},
];

/**
 * @param {vscode.TextDocument} document
 * @returns {Promise<vscode.Diagnostic[]>}
 */
async function getDiagnostics(document) {
	const text = document.getText();
	const diagnostics = [];

	const lines = text.split(/\r\n|\n/);

	let i = 0;
	while (lines.length > i && !/\s*}/.test(lines[i])) {
		for (let j = 0; j < TERMS.length; j++) {
			let { search, replacement, isStatic } = TERMS[j];

			const searchTermRegExp = new RegExp(search, 'gi');
			if (!searchTermRegExp.exec(lines[i])) {
				continue;
			}

			let start;
			let end;
			let finalSearch;
			let finalReplacement;
			if (isStatic) {
				start = lines[i].search(searchTermRegExp);
				end = start + search.length;

				if (lines[i].substring(end, end + 1) === ';') {
					end += 1;
					search += ';';
					replacement += ';';
				}

				finalSearch = search;
				finalReplacement = replacement;
			} else {
				const matchesRegExp = new RegExp(search, 'dig'); // flag 'd' gets the indices of the groups
				const matches = matchesRegExp.exec(lines[i]);

				// @ts-ignore
				start = matches.indices[1][0]; // start location of the match group without whitespace, etc.
				// @ts-ignore
				end = matches.indices[1][1];

				finalSearch = matches[1];

				if (lines[i].substring(end, end + 1) === ';') {
					end += 1;
					finalSearch += ';';
					replacement += ';';
				}

				finalReplacement = finalSearch.replace(matchesRegExp, replacement);
			}

			diagnostics.push({
				severity: vscode.DiagnosticSeverity.Warning,
				message: `🧠 ${finalReplacement} ⇔ ${finalSearch} 💪`,
				term: {
					search: finalSearch,
					replacement: finalReplacement,
					isStatic,
				},
				code: 'physical-property-detected',
				source: 'Logical Properties',
				range: new vscode.Range(i, start, i, end),
			});
		}

		i++;
	}

	return diagnostics;
}

/**
 * @param {vscode.DiagnosticCollection} diagnosticCollection
 * @param {vscode.TextDocument} document
 * @returns {Promise<void>}
 */
async function handler(diagnosticCollection, document) {
	diagnosticCollection.set(document.uri, await getDiagnostics(document));
}

/**
 * @type {vscode.StatusBarItem}
 */
let statusBarItem;

async function updateStatusBarItem() {
	let numberOfDiagnostics = 0;
	const diagnosticsResponses = vscode.languages.getDiagnostics();

	for (let diagnosticsResponse of diagnosticsResponses) {
		const currentDocument = vscode.window.activeTextEditor.document;
		const [documentUri, diagnostics] =
			/** @type {[vscode.Uri, Diagnostic[]]} */ (
				/** @type {unknown} */ (diagnosticsResponse)
			);

		if (documentUri === currentDocument.uri && diagnostics?.length) {
			for (let diagnostic of diagnostics) {
				if (diagnostic.code === 'physical-property-detected') {
					numberOfDiagnostics++;
				}
			}
		}
	}

	statusBarItem.text = `${
		numberOfDiagnostics
			? `$(alert) ${numberOfDiagnostics} 💪`
			: `$(check-all) 🧠`
	}`;
	statusBarItem.name = 'Logical Properties';

	if (numberOfDiagnostics) {
		statusBarItem.command =
			'logical-properties.replacePhysicalWithLogicalReplaceAll';
		statusBarItem.tooltip = `${numberOfDiagnostics} physical ${
			numberOfDiagnostics ? 'properties' : 'property'
		} detected. 💪

🖱 - Click to replace all 💪 physical properties with 🧠 logical properties.`;
		statusBarItem.color = new vscode.ThemeColor(
			'problemsWarningIcon.foreground'
		);
	} else {
		statusBarItem.command = null;
		statusBarItem.tooltip = `🧠 You've gone logical!
No physical properties detected!`;
		statusBarItem.color = '#F2ABBA';
	}

	statusBarItem.show();
}

/**
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 */
async function activate(context) {
	const diagnosticCollection =
		vscode.languages.createDiagnosticCollection('logical-properties');

	// When to run the check
	const didOpen = vscode.workspace.onDidOpenTextDocument(async (document) => {
		await handler(diagnosticCollection, document);

		updateStatusBarItem();
	});
	const didChange = vscode.workspace.onDidChangeTextDocument(async (event) => {
		await handler(diagnosticCollection, event.document);

		updateStatusBarItem();
	});

	// Lightbulb/Quick Fix action
	const codeActionProvider = vscode.languages.registerCodeActionsProvider(
		[
			'coffeescript',
			'css',
			'html',
			'javascript',
			'javascriptreact',
			'less',
			'markdown',
			'php',
			'plaintext',
			'sass',
			'scss',
			'stylus',
			'typescript',
			'typescriptreact',
			'vue',
			'vue-html',
			'xml',
			'xsl',
		],
		new ReplacePhysicalWithLogical(context, updateStatusBarItem)
	);

	// If we have an activeTextEditor when we open the workspace, trigger the handler
	if (vscode.window.activeTextEditor) {
		await handler(
			diagnosticCollection,
			vscode.window.activeTextEditor.document
		);
	}

	// Push all of the disposables that should be cleaned up when the extension is disabled
	context.subscriptions.push(
		diagnosticCollection,
		didOpen,
		didChange,
		codeActionProvider
	);

	// Show statusbar item
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		-100
	);
	context.subscriptions.push(statusBarItem);

	// register some listener that make sure the status bar item always up-to-date
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
	);
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
	);

	// update status bar item once at start
	updateStatusBarItem();
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
