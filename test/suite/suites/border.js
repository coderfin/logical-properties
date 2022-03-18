const assert = require('assert');
const { before, after } = require('mocha');
const { commands, languages, workspace, window } = require('vscode');
const path = require('path');
const fs = require('fs');
const { getFileName } = require('../generate-css-test-files');

const SEARCH_VALUES = Array.from(
	new Set([
		// Width
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
		// Color
		// keywords
		'aqua',
		'cyan',
		'fuchsia',
		'magenta',
		'darkgray',
		'darkgrey',
		'darkslategray',
		'darkslategrey',
		'dimgray',
		'dimgrey',
		'lightgray',
		'lightgrey',
		'lightslategray',
		'lightslategrey',
		'gray',
		'grey',
		'slategray',
		'slategrey',
		// other
		'currentColor',
		'transparent',
		// System Colors
		'ActiveText',
		'ButtonBorder',
		'ButtonFace',
		'ButtonText',
		'Canvas',
		'CanvasText',
		'Field',
		'FieldText',
		'GrayText',
		'Highlight',
		'HighlightText',
		'LinkText',
		'Mark',
		'MarkText',
		'VisitedText',
		// Deprecated
		'ActiveBorder',
		'ActiveCaption',
		'AppWorkspace',
		'Background',
		'ButtonHighlight',
		'ButtonShadow',
		'CaptionText',
		'InactiveBorder',
		'InactiveCaption',
		'InactiveCaptionText',
		'InfoBackground',
		'InfoText',
		'Menu',
		'MenuText',
		'Scrollbar',
		'ThreeDDarkShadow',
		'ThreeDFace',
		'ThreeDHighlight',
		'ThreeDLightShadow',
		'ThreeDShadow',
		'Window',
		'WindowFrame',
		'WindowText',
		// Mozilla
		'-moz-ButtonDefault',
		'-moz-ButtonHoverFace',
		'-moz-ButtonHoverText',
		'-moz-CellHighlight',
		'-moz-CellHighlightText',
		'-moz-Combobox',
		'-moz-ComboboxText',
		'-moz-Dialog',
		'-moz-DialogText',
		'-moz-dragtargetzone',
		'-moz-EvenTreeRow',
		'-moz-html-CellHighlight',
		'-moz-html-CellHighlightText',
		'-moz-mac-accentdarkestshadow',
		'-moz-mac-accentdarkshadow',
		'-moz-mac-accentface',
		'-moz-mac-accentlightesthighlight',
		'-moz-mac-accentlightshadow',
		'-moz-mac-accentregularhighlight',
		'-moz-mac-accentregularshadow',
		'-moz-mac-chrome-active',
		'-moz-mac-chrome-inactive',
		'-moz-mac-focusring',
		'-moz-mac-menuselect',
		'-moz-mac-menushadow',
		'-moz-mac-menutextselect',
		'-moz-mac-MenuHover',
		'-moz-MenuHoverText',
		'-moz-MenuBarText',
		'-moz-MenuBarHoverText',
		'-moz-nativehyperlinktext',
		'-moz-OddTreeRow',
		'-moz-win-communicationstext',
		'-moz-win-mediatext',
		'-moz-win-accentcolor',
		'-moz-win-accentcolortext',
		'-moz-activehyperlinttext',
		'-moz-default-background-color',
		'-moz-default-color',
		'-moz-hyperlinktext',
		'-moz-visitedhyperlinktext',
		// RGB
		'#FFFFFF',
		'#FFF',
		'#FFF8',
		'#FFFFFF88',
		'rgb(255, 255, 255)',
		'rgba(255, 255, 255, 0.5)',
		// HSL
		'hsl(0, 0%, 100%)',
		'hsl(0 0% 100%)',
		'hsla(0, 0%, 100%, 0.5)',
		// COLOR()
		'color(display-p3 1 0.5 0)',
		'color(display-p3 1 0.5 0 / 0.5)',
		// Style
		'dashed',
		'dotted',
		'double',
		'groove',
		'hidden',
		'inset',
		'none',
		'outset',
		'ridge',
		'solid',
		// All
		'10ch',
		'aqua',
		'dashed',
		'10ch aqua',
		'10ch dashed',
		'aqua 10ch',
		'aqua dashed',
		'dashed 10ch',
		'dashed aqua',
		'dashed aqua 10ch',
		'dashed 10ch aqua',
		'aqua 10ch dashed',
		'aqua dashed 10ch',
		'10ch aqua dashed',
		'10ch dashed aqua',
		'dotted',
		'ActiveText',
		'thin',
		'dotted ActiveText',
		'dotted thin',
		'ActiveText thin',
		'ActiveText dotted',
		'thin dotted',
		'thin ActiveText',
		'dotted ActiveText thin',
		'dotted thin ActiveText',
		'ActiveText dotted thin',
		'ActiveText thin dotted',
		'thin dotted ActiveText',
		'thin ActiveText dotted',
		'double',
		'-moz-ButtonDefault',
		'auto',
		'double -moz-ButtonDefault',
		'double auto',
		'-moz-ButtonDefault auto',
		'-moz-ButtonDefault double',
		'auto double',
		'auto -moz-ButtonDefault',
		'double -moz-ButtonDefault auto',
		'double auto -moz-ButtonDefault',
		'-moz-ButtonDefault double auto',
		'-moz-ButtonDefault auto double',
		'auto -moz-ButtonDefault double',
		'auto double -moz-ButtonDefault',
		'groove',
		'#FFFFFF',
		'calc(10q + 10px)',
		'groove #FFFFFF',
		'groove calc(10q + 10px)',
		'calc(10q + 10px) groove',
		'calc(10q + 10px) #FFFFFF',
		'#FFFFFF groove',
		'#FFFFFF calc(10q + 10px)',
		'groove #FFFFFF calc(10q + 10px)',
		'groove calc(10q + 10px) #FFFFFF',
		'calc(10q + 10px) groove #FFFFFF',
		'calc(10q + 10px) #FFFFFF groove',
		'#FFFFFF groove calc(10q + 10px)',
		'#FFFFFF calc(10q + 10px) groove',
		'hidden',
		'rgb(255, 255, 255)',
		'fit-content',
		'hidden rgb(255, 255, 255)',
		'hidden fit-content',
		'fit-content hidden',
		'fit-content rgb(255, 255, 255)',
		'rgb(255, 255, 255) hidden',
		'rgb(255, 255, 255) fit-content',
		'hidden rgb(255, 255, 255) fit-content',
		'hidden fit-content rgb(255, 255, 255)',
		'fit-content hidden rgb(255, 255, 255)',
		'fit-content rgb(255, 255, 255) hidden',
		'rgb(255, 255, 255) hidden fit-content',
		'rgb(255, 255, 255) fit-content hidden',
		'inset',
		'hsla(0, 0%, 0%, 0.5)',
		'fit-content(10px)',
		'inset hsla(0, 0%, 100%, 0.5)',
		'inset fit-content(10px)',
		'fit-content(10px) inset',
		'fit-content(10px) hsla(0, 0%, 100%, 0.5)',
		'hsla(0, 0%, 100%, 0.5) inset',
		'hsla(0, 0%, 100%, 0.5) fit-content',
		'inset hsla(0, 0%, 100%, 0.5) fit-content(10px)',
		'inset fit-content(10px) hsla(0, 0%, 100%, 0.5)',
		'fit-content(10px) inset hsla(0, 0%, 100%, 0.5)',
		'fit-content(10px) hsla(0, 0%, 100%, 0.5) inset',
		'hsla(0, 0%, 100%, 0.5) fit-content(10px) inset',
		'hsla(0, 0%, 100%, 0.5) inset fit-content(10px)',
		'none',
		'color(display-p3 1 0.5 0)',
		'max-content',
		'none color(display-p3 1 0.5 0)',
		'none max-content',
		'max-content none',
		'max-content color(display-p3 1 0.5 0)',
		'color(display-p3 1 0.5 0) none',
		'color(display-p3 1 0.5 0) max-content',
		'none color(display-p3 1 0.5 0) max-content',
		'none max-content color(display-p3 1 0.5 0)',
		'max-content none color(display-p3 1 0.5 0)',
		'max-content color(display-p3 1 0.5 0) none',
		'color(display-p3 1 0.5 0) none max-content',
		'color(display-p3 1 0.5 0) max-content none',
		'outset',
		'rgba(255, 255, 255, 0.5)',
		'none',
		'outset rgba(255, 255, 255, 0.5)',
		'outset none',
		'rgba(255, 255, 255, 0.5) none',
		'rgba(255, 255, 255, 0.5) outset',
		'none outset',
		'none rgba(255, 255, 255, 0.5)',
		'outset rgba(255, 255, 255, 0.5) none',
		'outset none rgba(255, 255, 255, 0.5)',
		'rgba(255, 255, 255, 0.5) outset none',
		'rgba(255, 255, 255, 0.5) none outset',
		'none rgba(255, 255, 255, 0.5) outset',
		'none outset rgba(255, 255, 255, 0.5)',
		'ridge',
		'color(display-p3 1 0.5 0 / 0.5)',
		'var(--size-10-percent)',
		'ridge color(display-p3 1 0.5 0 / 0.5)',
		'ridge var(--size-10-percent)',
		'var(--size-10-percent) ridge',
		'var(--size-10-percent) color(display-p3 1 0.5 0 / 0.5)',
		'color(display-p3 1 0.5 0 / 0.5) ridge',
		'color(display-p3 1 0.5 0 / 0.5) var(--size-10-percent)',
		'ridge color(display-p3 1 0.5 0 / 0.5) var(--size-10-percent)',
		'ridge var(--size-10-percent) color(display-p3 1 0.5 0 / 0.5)',
		'var(--size-10-percent) ridge color(display-p3 1 0.5 0 / 0.5)',
		'var(--size-10-percent) color(display-p3 1 0.5 0 / 0.5) ridge',
		'color(display-p3 1 0.5 0 / 0.5) ridge var(--size-10-percent)',
		'color(display-p3 1 0.5 0 / 0.5) var(--size-10-percent) ridge',
		'solid',
		'hsl(0, 0%, 100%)',
		'round(nearest 10.5px)',
		'solid hsl(0 0% 100%)',
		'solid round(nearest 10.5px)',
		'round(nearest 10.5px) solid',
		'round(nearest 10.5px) hsl(0 0% 100%)',
		'hsl(0 0% 100%) solid',
		'hsl(0 0% 100%) round(nearest 10.5px)',
		'solid hsl(0 0% 100%) round(nearest 10.5px)',
		'solid round(nearest 10.5px) hsl(0 0% 100%)',
		'round(nearest 10.5px) solid hsl(0 0% 100%)',
		'round(nearest 10.5px) hsl(0 0% 100%) solid',
		'hsl(0 0% 100%) round(nearest 10.5px) solid',
		'hsl(0 0% 100%) solid round(nearest 10.5px)',
		// Radius
		'10ch 10cm',
		'10cm 10ch',
		'10em 10ex',
		'10ex 10em',
		'10in 10lh',
		'10lh 10in',
		'10mm 10pc',
		'10pc 10mm',
		'10pt 10px',
		'10px 10pt',
		'10rem 10rlh',
		'10rlh 10rem',
		'10vh 10vmax',
		'10vmax 10vh',
		'10vmin 10vw',
		'10vw 10vmin',
		'10q abs(10% - 10px)',
		'abs(10% - 10px) 10q',
		'auto calc(10% + 10px)',
		'calc(10% + 10px) auto',
		'calc(10% - 10px) calc(10% * 10px)',
		'calc(10% * 10px) calc(10% - 10px)',
		'calc(10% / 10px) calc(acos(1) * 10px)',
		'calc(acos(1) * 10px) calc(10% / 10px)',
		'calc(asin(1) * 10px) calc(atan(0) * 10px)',
		'calc(atan(0) * 10px) calc(asin(1) * 10px)',
		'calc(atan2(0, 0) * 10px) calc(cos(0) * 10px)',
		'calc(cos(0) * 10px) calc(atan2(0, 0) * 10px)',
		'calc(exp(10) * 10px) calc(sign(-10px) * 10px)',
		'calc(sign(-10px) * 10px) calc(exp(10) * 10px)',
		'calc(sin(10) * 10px) calc(sqrt(4) * 10px)',
		'calc(sqrt(4) * 10px) calc(sin(10) * 10px)',
		'calc(tan(0) * 10px) clamp(1%, 5%, 10%)',
		'clamp(1%, 5%, 10%) calc(tan(0) * 10px)',
		'fit-content fit-content(10px)',
		'fit-content(10px) fit-content',
		'hypot(10px, 20px) max(1%, 5%, 10%)',
		'max(1%, 5%, 10%) hypot(10px, 20px)',
		'max-content min(10%, 5%, 1%)',
		'min(10%, 5%, 1%) max-content',
		'min-content mod(15px, 10px)',
		'mod(15px, 10px) min-content',
		'none pow(10px, 2)',
		'pow(10px, 2) none',
		'rem(15px, 10px) round(10.5px)', // Same as round("nearest", 10.5px)
		'round(10.5px) rem(15px, 10px)', // Same as round("nearest", 10.5px)
		'round(10.5px, 10px) round("nearest", 10.5px)', // Round to nearest 10px, === Math.round(10.5px)
		'round("nearest", 10.5px) round(10.5px, 10px)', // === Math.round(10.5px), Round to nearest 10px
		'round("up", 10.5px) round("down", 10.5px)', // === Math.ceil(10.5px), === Math.floor(10.5px)
		'round("down", 10.5px), round("up", 10.5px)', // === Math.floor(10.5px), === Math.ceil(10.5px)
		'round("to-zero", 10.5px) round(`nearest`, 10.5px)', // === Math.trunc(10.5px), === Math.round(10.5px)
		'round(`nearest`, 10.5px) round("to-zero", 10.5px)', // === Math.round(10.5px), === Math.trunc(10.5px)
		'round(`up`, 10.5px) round(`down`, 10.5px)', // === Math.ceil(10.5px), === Math.floor(10.5px)
		'round(`down`, 10.5px) round(`up`, 10.5px)', // === Math.floor(10.5px), === Math.ceil(10.5px)
		'round(`to-zero`, 10.5px) var(--size-10-percent)', // === Math.trunc(10.5px)
		'var(--size-10-percent) round(`to-zero`, 10.5px)', // === Math.trunc(10.5px)
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
		'fit-content',
		'fit-content(10px)',
		'hypot(10px, 20px)',
		'max(1%, 5%, 10%)',
		'max-content',
		'min(10%, 5%, 1%)',
		'min-content',
		'mod(15px, 10px)',
		'none',
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
	])
);

const PHYSICAL_PROPERTIES = [
	'border-left',
	'border-right',
	'border-top',
	'border-bottom',
	'border-left-width',
	'border-right-width',
	'border-top-width',
	'border-bottom-width',
	'border-left-color',
	'border-right-color',
	'border-top-color',
	'border-bottom-color',
	'border-bottom-style',
	'border-left-style',
	'border-right-style',
	'border-top-style',
	'border-top-left-radius',
	'border-bottom-left-radius',
	'border-top-right-radius',
	'border-bottom-right-radius',
];

module.exports = () => {
	const testDocuments = fs.readdirSync(
		path.join(workspace.workspaceFolders[0].uri.fsPath, 'css', 'border')
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
		suite(`css/border/${testDocument}`, () => {
			let diagnostics;
			let document;
			before(async () => {
				window.showInformationMessage(`Testing css/border/${testDocument}`);

				document = await workspace.openTextDocument(
					path.join(
						workspace.workspaceFolders[0].uri.fsPath,
						'css',
						'border',
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

			let part = '';
			if (/⎯color-/.test(testDocument)) {
				part = '-color';
			} else if (/style/.test(testDocument)) {
				part = '-style';
			} else if (/width/.test(testDocument)) {
				part = '-width';
			} else if (/radius/.test(testDocument)) {
				part = '-radius';
			}

			let physicalProperty = 'left';
			if (/radius/.test(testDocument)) {
				if (/top-right/.test(testDocument)) {
					physicalProperty = 'top-right';
				} else if (/top-left/.test(testDocument)) {
					physicalProperty = 'top-left';
				} else if (/bottom-right/.test(testDocument)) {
					physicalProperty = 'bottom-right';
				} else if (/bottom-left/.test(testDocument)) {
					physicalProperty = 'bottom-left';
				}
			} else {
				if (/right/.test(testDocument)) {
					physicalProperty = 'right';
				} else if (/top/.test(testDocument)) {
					physicalProperty = 'top';
				} else if (/bottom/.test(testDocument)) {
					physicalProperty = 'bottom';
				}
			}

			let direction = '';
			if (!/radius/.test(testDocument)) {
				if (/top/.test(testDocument) || /bottom/.test(testDocument)) {
					direction = '-block';
				} else if (/left/.test(testDocument) || /right/.test(testDocument)) {
					direction = '-inline';
				}
			}

			let location = 'start';
			if (/radius/.test(testDocument)) {
				if (/top-right/.test(testDocument)) {
					location = 'end-start';
				} else if (/top-left/.test(testDocument)) {
					location = 'start-start';
				} else if (/bottom-right/.test(testDocument)) {
					location = 'end-end';
				} else if (/bottom-left/.test(testDocument)) {
					location = 'start-end';
				}
			} else {
				if (/right/.test(testDocument) || /bottom/.test(testDocument)) {
					location = 'end';
				}
			}

			const value = toSearch[testDocument];
			if (value) {
				test(`shows that 'border-${physicalProperty}${part}: ${value};' is replaced with 'border${direction}-${location}${part}: ${value};'`, () => {
					const border = diagnostics.find(
						(diagnostic) =>
							diagnostic.term.found ===
							`border-${physicalProperty}${part}: ${value};`
					);
					assert.strictEqual(
						border.term.replacement,
						`border${direction}-${location}${part}: ${value};`,
						'Should be replaced.'
					);
				});
			}
		});
	});
};
