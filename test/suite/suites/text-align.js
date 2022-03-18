const assert = require('assert');
const { before, after } = require('mocha');
const { commands, languages, workspace, window } = require('vscode');
const path = require('path');
const fs = require('fs');
const { getFileName } = require('../generate-css-test-files');

module.exports = () => {
	const testDocuments = fs.readdirSync(
		path.join(workspace.workspaceFolders[0].uri.fsPath, 'css', 'text-align')
	);

	testDocuments.forEach((testDocument) => {
		suite(`css/text-align/${testDocument}`, () => {
			let diagnostics;
			let document;
			before(async () => {
				window.showInformationMessage(`Testing css/text-align/${testDocument}`);
				document = await workspace.openTextDocument(
					path.join(
						workspace.workspaceFolders[0].uri.fsPath,
						'css',
						'text-align',
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
				getFileName({
					property: 'text-align',
					value: 'left',
					validity: 'valid',
				})
			) {
				test('shows that `text-align: left` is replaced with `text-align: start`', () => {
					const textAlignLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'text-align: left;'
					);
					assert.strictEqual(
						textAlignLeft.term.replacement,
						'text-align: start;',
						'Should be replaced.'
					);
				});
			}

			// NOTE: Currently not valid
			if (
				testDocument ===
				getFileName({
					property: 'text-align',
					value: '"." left',
					validity: 'valid',
				})
			) {
				test('shows that `text-align: "." left` is replaced with `text-align: "." start`', () => {
					const textAlignLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'text-align: "." left;'
					);
					assert.strictEqual(
						textAlignLeft.term.replacement,
						'text-align: "." start;',
						'Should be replaced.'
					);
				});
			}

			if (
				testDocument ===
				getFileName({
					property: 'text-align',
					value: 'right',
					validity: 'valid',
				})
			) {
				test('shows that `text-align: right` is replaced with `text-align: end`', () => {
					const textAlignLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'text-align: right;'
					);
					assert.strictEqual(
						textAlignLeft.term.replacement,
						'text-align: end;',
						'Should be replaced.'
					);
				});
			}

			// NOTE: Currently not valid
			if (
				testDocument ===
				getFileName({
					property: 'text-align',
					value: '"." right',
					validity: 'valid',
				})
			) {
				test('shows that `text-align: "." right` is replaced with `text-align: "." end`', () => {
					const textAlignLeft = diagnostics.find(
						(diagnostic) => diagnostic.term.found === 'text-align: "." right;'
					);
					assert.strictEqual(
						textAlignLeft.term.replacement,
						'text-align: "." end;',
						'Should be replaced.'
					);
				});
			}
		});
	});
};
