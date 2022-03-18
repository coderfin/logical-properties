const assert = require('assert');
const { before, after } = require('mocha');
const { commands, languages, workspace, window } = require('vscode');
const path = require('path');
const fs = require('fs');
const { getFileName } = require('../generate-css-test-files');

module.exports = () => {
	const testDocuments = fs.readdirSync(
		path.join(workspace.workspaceFolders[0].uri.fsPath, 'css', 'float')
	);

	testDocuments.forEach((testDocument) => {
		suite(`css/float/${testDocument}`, () => {
			let diagnostics;
			let document;
			before(async () => {
				window.showInformationMessage(`Testing css/float/${testDocument}`);

				document = await workspace.openTextDocument(
					path.join(
						workspace.workspaceFolders[0].uri.fsPath,
						'css',
						'float',
						testDocument
					)
				);
				await window.showTextDocument(document);

				diagnostics = languages.getDiagnostics(document.uri);
			});

			after(() => {
				commands.executeCommand('workbench.action.closeActiveEditor');
			});

			test('shows the correct amount of detected physical properties', function () {
				const count = parseInt(
					/Expected Diagnostic Count: (?<count>\d*)/.exec(document.getText())
						.groups.count
				);

				this.test.title = `shows ${diagnostics.length} detected physical properties of an expected ${count}`;

				assert.strictEqual(diagnostics.length, count, `Should have ${count}.`);
			});

			test('shows physical properties with or without a semicolon', () => {
				diagnostics.forEach((diagnostic) => {
					if (diagnostic.term.found.endsWith(';')) {
						assert.strictEqual(
							diagnostic.term.replacement.endsWith(';'),
							true,
							'Should end with a semicolon.'
						);
					} else {
						assert.strictEqual(
							diagnostic.term.replacement.endsWith(';'),
							false,
							'Should not end with a semicolon.'
						);
					}
				});
			});

			if (
				testDocument ===
				getFileName({ property: 'float', value: 'left', validity: 'valid' })
			) {
				test('shows that `float: left` is replaced with `float: inline-start`', () => {
					const floatLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'float: left;'
					);
					assert.strictEqual(
						floatLeft.term.replacement,
						'float: inline-start;',
						'Should be replaced.'
					);
				});
			}

			if (
				testDocument ===
				getFileName({ property: 'float', value: 'right', validity: 'valid' })
			) {
				test('shows that `float: right` is replaced with `float: inline-end`', () => {
					const floatLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'float: right;'
					);
					assert.strictEqual(
						floatLeft.term.replacement,
						'float: inline-end;',
						'Should be replaced.'
					);
				});
			}
		});
	});
};