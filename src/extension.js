// ./setup-pnp needs to be required first
require('./setup-pnp');
const vscode = require('vscode');
const ReplacePhysicalWithLogicalProvider = require('./ReplacePhysicalWithLogicalProvider');
const helpers = require('./helpers');
const /** @type {vscode.DocumentSelector[]} */ /** @type {unknown} */ supportedFilesTypes = require('./supportedFilesTypes');

const {
	statusBarItem,
	setStatusBarItem,
	updateStatusBarItem,
	documentEventHandler,
} = helpers;

/**
 * Runs when the extension an extension activation event occurs.
 * See: package.json --> activationEvents
 *
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<void>}
 */
async function activate(context) {
	const diagnosticCollection =
		vscode.languages.createDiagnosticCollection('logical-properties');

	// When to run the check
	const didOpen = vscode.workspace.onDidOpenTextDocument(async (document) => {
		await documentEventHandler(diagnosticCollection, document);

		updateStatusBarItem();
	});
	const didClose = vscode.workspace.onDidCloseTextDocument(async (document) => {
		await documentEventHandler(diagnosticCollection, document);

		updateStatusBarItem();
	});
	const didChange = vscode.workspace.onDidChangeTextDocument(async (event) => {
		await documentEventHandler(diagnosticCollection, event?.document);

		updateStatusBarItem();
	});
	const didChangeVisible = vscode.window.onDidChangeVisibleTextEditors(
		async (textEditors) => {
			for (let textEditor of textEditors) {
				await documentEventHandler(diagnosticCollection, textEditor?.document);
			}

			updateStatusBarItem();
		}
	);

	// Lightbulb/Quick Fix action
	const codeActionProvider = vscode.languages.registerCodeActionsProvider(
		supportedFilesTypes,
		new ReplacePhysicalWithLogicalProvider(context, updateStatusBarItem)
	);

	// If we have an activeTextEditor when we open the workspace, trigger the handler
	if (vscode.window.activeTextEditor) {
		await documentEventHandler(
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
	setStatusBarItem(
		vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -100)
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

/**
 * Runs when the extension is deactivated.
 *
 * @returns {void}
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
