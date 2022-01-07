const vscode = require('vscode');

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

class ReplacePhysicalWithLogical {
	constructor(context, updateStatusBarItem) {
		const commandQuickFix = vscode.commands.registerCommand(
			'logical-properties.replacePhysicalWithLogicalQuickFix',
			async (range, replacement) => {
				const editor = vscode.window.activeTextEditor;

				await new Promise((resolve) =>
					editor
						.edit((editBuilder) => editBuilder.replace(range, replacement))
						.then(resolve)
				);

				updateStatusBarItem();
			}
		);

		const replaceAsync = async (diagnostic) => {
			return new Promise((resolve) => {
				vscode.commands
					.executeCommand(
						'logical-properties.replacePhysicalWithLogicalQuickFix',
						diagnostic.range,
						diagnostic.term.replacement
					)
					.then(resolve);
			});
		};

		const commandReplaceAll = vscode.commands.registerCommand(
			'logical-properties.replacePhysicalWithLogicalReplaceAll',
			async () => {
				const currentDocument = vscode.window.activeTextEditor?.document;
				if (!currentDocument) {
					return;
				}

				const diagnosticsResponses = vscode.languages.getDiagnostics();

				for (let diagnosticsResponse of diagnosticsResponses.reverse()) {
					const [documentUri, diagnostics] =
						/** @type {[vscode.Uri, Diagnostic[]]} */ (
							/** @type {unknown} */ (diagnosticsResponse)
						);

					if (documentUri === currentDocument.uri && diagnostics?.length) {
						diagnostics.reverse().sort((diagnosticA, diagnosticB) => {
							if (diagnosticB.range.start.line > diagnosticA.range.start.line) {
								return -1;
							}
							if (diagnosticB.range.start.line < diagnosticA.range.start.line) {
								return 1;
							}

							if (
								diagnosticB.range.start.character >
								diagnosticA.range.start.character
							) {
								return 1;
							}
							if (
								diagnosticB.range.start.character <
								diagnosticA.range.start.character
							) {
								return -1;
							}
						});

						for (let diagnostic of diagnostics) {
							if (diagnostic.code === 'physical-property-detected') {
								await replaceAsync(diagnostic);
							}
						}
					}
				}

				updateStatusBarItem();
			}
		);

		context.subscriptions.push(commandReplaceAll);
		context.subscriptions.push(commandQuickFix);
	}

	provideCodeActions(document, range, context) {
		// for each diagnostic entry that has the matching `code`, create a code action command
		return context.diagnostics
			.filter((diagnostic) => diagnostic.code === 'physical-property-detected')
			.map((diagnostic) => this.createCommandCodeActionQuickFix(diagnostic));
	}

	createCommandCodeActionQuickFix(diagnostic) {
		const action = new vscode.CodeAction(
			`Replace "${diagnostic.term.search}" with "${diagnostic.term.replacement}".`,
			vscode.CodeActionKind.QuickFix
		);

		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		action.command = {
			command: 'logical-properties.replacePhysicalWithLogicalQuickFix',
			title: 'Use logical property',
			tooltip: 'Replace physical property with logical property.',
			arguments: [diagnostic.range, diagnostic.term.replacement],
		};

		return action;
	}
}

module.exports = ReplacePhysicalWithLogical;
