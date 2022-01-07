const vscode = require('vscode');
const ReplacePhysicalWithLogical = require('./ReplacePhysicalWithLogical');
const execWithIndices = require('regexp-match-indices');

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
		search: '(?:[^-]|^)(float:(\\s*)(left)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'float:$2inline-start$4',
		isStatic: true,
	},
	{
		search: '(?:[^-]|^)(float:(\\s*)(right)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'float:$2inline-end$4',
		isStatic: true,
	},
	{
		search: '(?:[^-]|^)(clear:(\\s*)(left)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'clear:$2inline-start$4',
		isStatic: true,
	},
	{
		search: '(?:[^-]|^)(clear:(\\s*)(right)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'clear:$2inline-end$4',
		isStatic: true,
	},
	// TEXT ALIGN
	{
		search:
			'(?:[^-]|^)(text-align:(\\s*)(left)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'text-align:$2start$4',
		isStatic: true,
	},
	{
		search:
			'(?:[^-]|^)(text-align:(\\s*)(right)(\\s!important)?)(?:;|$|\\s|"|})',
		replacement: 'text-align:$2end$4',
		isStatic: true,
	},
	// POSITION
	{
		search: 'left',
		replacement: 'inset-inline-start',
	},
	{
		search: 'right',
		replacement: 'inset-inline-end',
	},
	{
		search: 'top',
		replacement: 'inset-block-start',
	},
	{
		search: 'bottom',
		replacement: 'inset-block-end',
	},
	// DIMENSIONS
	{
		search: 'width',
		replacement: 'inline-size',
	},
	{
		search: 'height',
		replacement: 'block-size',
	},
	{
		search: 'min-width',
		replacement: 'min-inline-size',
	},
	{
		search: 'min-height',
		replacement: 'min-block-size',
	},
	{
		search: 'max-width',
		replacement: 'max-inline-size',
	},
	{
		search: 'max-height',
		replacement: 'max-block-size',
	},
	// MARGINS
	{
		search: 'margin-left',
		replacement: 'margin-inline-start',
	},
	{
		search: 'margin-right',
		replacement: 'margin-inline-end',
	},
	{
		search: 'margin-top',
		replacement: 'margin-block-start',
	},
	{
		search: 'margin-bottom',
		replacement: 'margin-block-end',
	},
	// PADDINGS
	{
		search: 'padding-left',
		replacement: 'padding-inline-start',
	},
	{
		search: 'padding-right',
		replacement: 'padding-inline-end',
	},
	{
		search: 'padding-top',
		replacement: 'padding-block-start',
	},
	{
		search: 'padding-bottom',
		replacement: 'padding-block-end',
	},
	// BORDERS
	{
		search: 'border-left-width',
		replacement: 'border-inline-start-width',
	},
	{
		search: 'border-right-width',
		replacement: 'border-inline-end-width',
	},
	{
		search: 'border-top-width',
		replacement: 'border-block-start-width',
	},
	{
		search: 'border-bottom-width',
		replacement: 'border-block-end-width',
	},
	{
		search: 'border-left-color',
		replacement: 'border-inline-start-color',
	},
	{
		search: 'border-right-color',
		replacement: 'border-inline-end-color',
	},
	{
		search: 'border-top-color',
		replacement: 'border-block-start-color',
	},
	{
		search: 'border-bottom-color',
		replacement: 'border-block-end-color',
	},
	{
		search: 'border-left-style',
		replacement: 'border-inline-start-style',
	},
	{
		search: 'border-right-style',
		replacement: 'border-inline-end-style',
	},
	{
		search: 'border-top-style',
		replacement: 'border-block-start-style',
	},
	{
		search: 'border-bottom-style',
		replacement: 'border-block-end-style',
	},
	{
		search: 'border-top-left-radius',
		replacement: 'border-start-start-radius',
	},
	{
		search: 'border-top-right-radius',
		replacement: 'border-end-start-radius',
	},
	{
		search: 'border-bottom-left-radius',
		replacement: 'border-start-end-radius',
	},
	{
		search: 'border-bottom-right-radius',
		replacement: 'border-end-end-radius',
	},
	{
		search: 'border-left',
		replacement: 'border-inline-start',
	},
	{
		search: 'border-right',
		replacement: 'border-inline-end',
	},
	{
		search: 'border-top',
		replacement: 'border-block-start',
	},
	{
		search: 'border-bottom',
		replacement: 'border-block-end',
	},
];

/**
 * @param {vscode.TextDocument} document
 * @returns {Promise<vscode.Diagnostic[]>}
 */
async function getDiagnostics(document) {
	if (document.isClosed) {
		return [];
	}

	const text = document.getText();
	const diagnostics = [];

	const lines = text.split(/\r\n|\n/);

	let i = 0;
	while (lines.length > i) {
		for (let j = 0; j < TERMS.length; j++) {
			let { search, replacement, isStatic } = TERMS[j];

			const searchTermRegExp = new RegExp(search, 'gi');
			if (!searchTermRegExp.test(lines[i])) {
				continue;
			}

			let toSearch = isStatic
				? search
				: `(?:[^-]|^)(${search}:(\\s*)(.*?)(\\s!important)?)(?:;|$|\\s|"|})`;
			let withReplacement = isStatic ? replacement : `${replacement}:$2$3$4`;
			const matchesRegExp = new RegExp(toSearch, 'gi');
			const replaceRegExp = new RegExp(toSearch, 'gi');
			let finalSearch;
			let finalReplacement;
			let start;
			let end;
			let matches;
			while ((matches = execWithIndices(matchesRegExp, lines[i])) !== null) {
				// @ts-ignore
				start = matches.indices[1][0]; // start location of the match group without whitespace, etc.
				// @ts-ignore
				end = matches.indices[1][1];

				finalSearch = matches[1];
				finalReplacement = withReplacement;

				if (lines[i].substring(end, end + 1) === ';') {
					end += 1;
					finalSearch += ';';
					finalReplacement += ';';
				}

				finalReplacement = finalSearch.replace(replaceRegExp, finalReplacement);

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
	if (document && document.uri.scheme === 'file') {
		diagnosticCollection.set(document.uri, await getDiagnostics(document));
	}
}

/**
 * @type {vscode.StatusBarItem}
 */
let statusBarItem;

async function updateStatusBarItem() {
	let numberOfDiagnostics = 0;
	const diagnosticsResponses = vscode.languages.getDiagnostics();

	for (let diagnosticsResponse of diagnosticsResponses) {
		const currentDocument = vscode.window.activeTextEditor?.document;
		if (!currentDocument) {
			continue;
		}

		const [documentUri, diagnostics] =
			/** @type {[vscode.Uri, Diagnostic[]]} */ (
				/** @type {unknown} */ (diagnosticsResponse)
			);

		if (
			documentUri.scheme === 'file' &&
			documentUri.path === currentDocument.uri.path &&
			diagnostics?.length
		) {
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
		statusBarItem.tooltip = `${numberOfDiagnostics} possible physical ${
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
	const didClose = vscode.workspace.onDidCloseTextDocument(async (document) => {
		await handler(diagnosticCollection, document);

		updateStatusBarItem();
	});
	const didChange = vscode.workspace.onDidChangeTextDocument(async (event) => {
		await handler(diagnosticCollection, event?.document);

		updateStatusBarItem();
	});
	const didChangeVisible = vscode.window.onDidChangeVisibleTextEditors(
		async (textEditors) => {
			for (let textEditor of textEditors) {
				await handler(diagnosticCollection, textEditor?.document);
			}

			updateStatusBarItem();
		}
	);

	// Lightbulb/Quick Fix action
	const codeActionProvider = vscode.languages.registerCodeActionsProvider(
		[
			{ scheme: 'file', language: 'coffeescript' },
			{ scheme: 'file', language: 'css' },
			{ scheme: 'file', language: 'html' },
			{ scheme: 'file', language: 'javascript' },
			{ scheme: 'file', language: 'javascriptreact' },
			{ scheme: 'file', language: 'less' },
			{ scheme: 'file', language: 'markdown' },
			{ scheme: 'file', language: 'php' },
			{ scheme: 'file', language: 'plaintext' },
			{ scheme: 'file', language: 'sass' },
			{ scheme: 'file', language: 'scss' },
			{ scheme: 'file', language: 'stylus' },
			{ scheme: 'file', language: 'typescript' },
			{ scheme: 'file', language: 'typescriptreact' },
			{ scheme: 'file', language: 'vue' },
			{ scheme: 'file', language: 'vue-html' },
			{ scheme: 'file', language: 'xml' },
			{ scheme: 'file', language: 'xsl' },
		],
		new ReplacePhysicalWithLogical(context, updateStatusBarItem)
	);

	// If we have an activeTextEditor when we open the workspace, trigger the handler
	if (vscode.window.activeTextEditor) {
		await handler(
			diagnosticCollection,
			vscode.window.activeTextEditor?.document
		);
	}

	// Push all of the disposables that should be cleaned up when the extension is disabled
	context.subscriptions.push(
		diagnosticCollection,
		didOpen,
		didClose,
		didChange,
		didChangeVisible,
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
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem),
		vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem),
		vscode.window.onDidChangeVisibleTextEditors(updateStatusBarItem)
	);

	// update status bar item once at start
	updateStatusBarItem();
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
