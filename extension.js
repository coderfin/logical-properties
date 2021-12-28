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
	{
		search: 'float: left',
		replacement: 'float: inline-start',
	},
	{
		search: 'float: right',
		replacement: 'float: inline-end',
	},
	{
		search: 'clear: left',
		replacement: 'clear: inline-start',
	},
	{
		search: 'clear: right',
		replacement: 'clear: inline-end',
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
			let { search, replacement } = TERMS[j];

			const searchTermRegExp = new RegExp(search, 'gi');
			if (!searchTermRegExp.exec(lines[i])) {
				continue;
			}

			const start = lines[i].search(searchTermRegExp);
			let end = start + search.length;

			if (lines[i].substring(end, end + 1) === ';') {
				end += 1;
				search += ';';
				replacement += ';';
			}

			diagnostics.push({
				severity: vscode.DiagnosticSeverity.Information,
				message: `🧠 ${replacement} ⇔ ${search} 💪`,
				term: {
					search,
					replacement,
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
		const [, diagnostics] = /** @type {[vscode.Uri, Diagnostic[]]} */ (
			/** @type {unknown} */ (diagnosticsResponse)
		);

		if (diagnostics) {
			for (let diagnostic of diagnostics) {
				if (diagnostic.code === 'physical-property-detected') {
					numberOfDiagnostics++;
				}
			}
		}
	}

	statusBarItem.text = `${
		numberOfDiagnostics ? '💪' : '🧠'
	} Logical Properties`;
	statusBarItem.name = 'Logical Properties';

	if (numberOfDiagnostics) {
		statusBarItem.command =
			'logical-properties.replacePhysicalWithLogicalReplaceAll';
		statusBarItem.tooltip = `${numberOfDiagnostics} Physical Properties Detected 💪

🖱 - Click to replace all 💪 physical properties with 🧠 logical properties.`;
	} else {
		statusBarItem.command = null;
		statusBarItem.tooltip = `🧠 No Physical Properties Detected!`;
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
