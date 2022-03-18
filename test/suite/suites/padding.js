const assert = require('assert');
const { before, after } = require('mocha');
const { commands, languages, workspace, window } = require('vscode');
const path = require('path');
const fs = require('fs');
const { getFriendlyText, getFileName } = require('../generate-css-test-files');

const SEARCH_VALUES = [
	'10ch',
	'10cm',
	'10em',
	'10ex',
	'10in',
	'10lh',
	'10mm',
	'10pc',
	'10pt',
	'10px',
	'10rem',
	'10rlh',
	'10vh',
	'10vmax',
	'10vmin',
	'10vw',
	'10q',
	'abs(10% - 10px)',
	'auto',
	'calc(10% + 10px)',
	'calc(10% - 10px)',
	'calc(10% * 10px)',
	'calc(10% / 10px)',
	'calc(acos(1) * 10px)',
	'calc(asin(1) * 10px)',
	'calc(atan(0) * 10px)',
	'calc(atan2(0, 0) * 10px)',
	'calc(cos(0) * 10px)',
	'calc(exp(10) * 10px)',
	'calc(sign(-10px) * 10px)',
	'calc(sin(10) * 10px)',
	'calc(sqrt(4) * 10px)',
	'calc(tan(0) * 10px)',
	'clamp(1%, 5%, 10%)',
	'fit-content(10px)',
	'hypot(10px, 20px)',
	'max(1%, 5%, 10%)',
	'min(10%, 5%, 1%)',
	'mod(15px, 10px)',
	'pow(10px, 2)',
	'rem(15px, 10px)',
	'round(10.5px)', // Same as round("nearest", 10.5px)
	'round(10.5px, 10px)', // Round to nearest 10px
	'round("nearest", 10.5px)', // === Math.round(10.5px)
	'round("up", 10.5px)', // === Math.ceil(10.5px)
	'round("down", 10.5px)', // === Math.floor(10.5px)
	'round("to-zero", 10.5px)', // === Math.trunc(10.5px)
	'round(`nearest`, 10.5px)', // === Math.round(10.5px)
	'round(`up`, 10.5px)', // == Math.ceil(10.5px)
	'round(`down`, 10.5px)', // === Math.floor(10.5px)
	'round(`to-zero`, 10.5px)', // === Math.trunc(10.5px)
	'var(--size-10-percent)',
	'10cap',
	'10dvb',
	'10dvh',
	'10dvi',
	'10dvmax',
	'10dvmin',
	'10dvw',
	'10ic',
	'10lvh',
	'10lvi',
	'10lvmax',
	'10lvmin',
	'10lvw',
	'10rcap',
	'10rch',
	'10rex',
	'10ric',
	'10slvb',
	'10svb',
	'10svh',
	'10svi',
	'10svmax',
	'10svmin',
	'10svw',
	'10vb',
	'10vi',
	'calc(log(10,e) * 10px)',
	'toggle(10px, 20px)',
	'mix(10%; 10px; 20px)',
	"round('nearest', 10.5px)", // === Math.round(10.5px)
	"round('up', 10.5px)", // === Math.ceil(10.5px)
	"round('down', 10.5px)", // === Math.floor(10.5px)
	"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
	'inherit',
	'initial',
	'revert',
	'unset',
];

const PHYSICAL_PROPERTIES = [
	'padding-left',
	'padding-right',
	'padding-top',
	'padding-bottom',
];

module.exports = () => {
	const testDocuments = fs.readdirSync(
		path.join(workspace.workspaceFolders[0].uri.fsPath, 'css', 'padding')
	);

	const toSearch = {};
	PHYSICAL_PROPERTIES.forEach((physicalProperty) => {
		[...SEARCH_VALUES].map((value) => {
			toSearch[
				getFileName({ property: physicalProperty, value, validity: 'valid' })
			] = value;
		});
	});

	testDocuments.forEach((testDocument) => {
		suite(`css/padding/${testDocument}`, () => {
			let diagnostics;
			let document;
			before(async () => {
				window.showInformationMessage(`Testing css/padding/${testDocument}`);

				document = await workspace.openTextDocument(
					path.join(
						workspace.workspaceFolders[0].uri.fsPath,
						'css',
						'padding',
						testDocument
					)
				);
				await window.showTextDocument(document);

				diagnostics = languages
					.getDiagnostics(document.uri)
					.filter((diagnostic) => diagnostic.source === 'Logical Properties');
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

			let physicalProperty = 'padding-left';
			if (testDocument.includes(getFriendlyText('padding-right'))) {
				physicalProperty = 'padding-right';
			} else if (testDocument.includes(getFriendlyText('padding-top'))) {
				physicalProperty = 'padding-top';
			} else if (testDocument.includes(getFriendlyText('padding-bottom'))) {
				physicalProperty = 'padding-bottom';
			}

			let direction = 'inline';
			if (['padding-top', 'padding-bottom'].includes(physicalProperty)) {
				direction = 'block';
			}

			let location = 'start';
			if (['padding-right', 'padding-bottom'].includes(physicalProperty)) {
				location = 'end';
			}

			const value = toSearch[testDocument];
			if (value) {
				test(`shows that '${physicalProperty}: ${value};' is replaced with 'padding-${direction}-${location}: ${value};'`, () => {
					const padding = diagnostics.find(
						(diagnostic) =>
							diagnostic.term.found === `${physicalProperty}: ${value};`
					);
					assert.strictEqual(
						padding.term.replacement,
						`padding-${direction}-${location}: ${value};`,
						'Should be replaced.'
					);
				});
			}
		});
	});
};
