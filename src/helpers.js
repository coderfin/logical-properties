const vscode = require('vscode');
const /** @type {Term[]} */ TERMS = require('./terms');
const cssTree = require('css-tree');
const stylelint = require('stylelint');
const rules = require('./stylelint-rules');

/** @type {any} */
const { parse, findAll } = cssTree;

const propertiesWithPhysicalValues = [
	...new Set(TERMS.filter((term) => term.value).map((term) => term.property)),
];
const propertiesWithoutPhysicalValues = TERMS.filter((term) => !term.value).map(
	(term) => term.property
);

/**
 * @typedef Term
 * @type {object}
 * @property {string} property - the property that is a physical property to search for.
 * @property {string} [value] - the value that is a physical property to search for.
 * @property {string} replacement - the logical property replacement.
 */

/**
 * @typedef Diagnostic
 * @type {object}
 * @property {vscode.Range} range - the range.
 * @property {string} message - the message.
 * @property {string} code - the code.
 * @property {string} source - the source.
 * @property {object} term - the term.
 * @property {string} term.found - the term that was found in the document.
 * @property {string} term.replacement - the replacement term.
 */

/**
 * Retrieves the diagnostics (a line that has one or more physical property) for the current document.
 *
 * @param {vscode.TextDocument} document
 * @returns {Promise<vscode.Diagnostic[]>}
 */
async function getDiagnostics(document) {
	if (document.isClosed) {
		return [];
	}

	const text = document
		.getText()
		.replace(/\*/g, '\\*')
		.replace(/([^\s]){/g, '$1\\{')
		.replace(/\[/g, '\\[')
		.replace(/\(/g, '\\(')
		.replace(/\!/g, '\\!');
	const diagnostics = [];

	const ast = parse(text, {
		positions: true,
	});
	const declarations = findAll(ast, (node) => {
		return (
			node.type === 'Declaration' &&
			[
				...propertiesWithPhysicalValues,
				...propertiesWithoutPhysicalValues,
			].includes(node.property)
		);
	});

	for (let i = 0; i < declarations.length; i++) {
		const declaration = declarations[i];

		let range = new vscode.Range(
			declaration.loc.start.line - 1,
			declaration.loc.start.column - 1,
			declaration.loc.end.line - 1,
			declaration.loc.end.column - 1
		);

		let text = document.getText(range);

		if (/\s*$/.test(text)) {
			if (declaration.loc.start.line !== declaration.loc.end.line) {
				range = new vscode.Range(
					declaration.loc.start.line - 1,
					declaration.loc.start.column - 1,
					declaration.loc.start.line - 1,
					declaration.loc.start.column + text.trimEnd().length - 1
				);
			} else {
				range = new vscode.Range(
					declaration.loc.start.line - 1,
					declaration.loc.start.column - 1,
					declaration.loc.end.line - 1,
					declaration.loc.end.column - 1 - /\s*$/.exec(text)[0].length
				);
			}
		}

		let semicolonRange = new vscode.Range(
			range.start.line,
			range.start.character,
			range.end.line,
			range.end.character + 1
		);

		text = document.getText(semicolonRange).trimEnd();

		if (text.endsWith(';')) {
			range = semicolonRange;
		}

		const declarationValue = declaration.value;
		let value = declarationValue.value;
		if (declarationValue.type === 'Value') {
			const valueRange = new vscode.Range(
				declarationValue.loc.start.line - 1,
				declarationValue.loc.start.column - 1,
				declarationValue.loc.end.line - 1,
				declarationValue.loc.end.column - 1
			);

			value = document.getText(valueRange).trimEnd();
		}

		value = value.replace(/\\/g, '').toLowerCase();

		const term = TERMS.find((term) => {
			if (term.value) {
				return (
					term.value === value.replace(/\s!important;?/, '').trim() &&
					term.property === declaration.property
				);
			}

			return term.property === declaration.property;
		});

		let finalReplacement = text;
		if (term?.value && term?.replacement) {
			finalReplacement = text.replace(term.value, term.replacement);
		} else if (term?.replacement) {
			finalReplacement = text.replace(declaration.property, term.replacement);
		}

		const lintResults = await stylelint.lint({
			code: `.test { ${finalReplacement.replace(
				new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'),
				value
			)}${finalReplacement.endsWith(';') ? '' : ';'} }\n`,
			config: { rules },
		});

		let { errored: isInvalidValue } = lintResults;

		if (['@', '#', '*', ',', '/'].includes(value.substr(-1))) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(auto|inherit|initial|revert|unset|min-content|max-content|thick|thin|medium)/.test(
				value
			) &&
			!/(^|\s)(auto|inherit|initial|revert|unset|min-content|max-content|thick|thin|medium)(\s!important)?(;?$|\s)/g.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})/i.test(
				value
			) &&
			!/(^|\s)(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})(\s!important)?(;?$|\s)/i.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|orange|aliceblue|antiquewhite|aquamarine|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|gold|goldenrod|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|magenta|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olivedrab|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|turquoise|violet|wheat|whitesmoke|yellowgreen|rebeccapurple)/i.test(
				value
			) &&
			!/(^|\s)(black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|orange|aliceblue|antiquewhite|aquamarine|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|gold|goldenrod|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|magenta|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olivedrab|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|turquoise|violet|wheat|whitesmoke|yellowgreen|rebeccapurple)(\s!important)?(;?$|\s)/i.test(
				value
			) &&
			!/^GrayText/i.test(value)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(transparent|currentColor)/i.test(value) &&
			!/(^|\s)(transparent|currentColor)(\s!important)?(;?$|\s)/i.test(value)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(ActiveText|ButtonBorder|ButtonFace|ButtonText|Canvas|CanvasText|Field|FieldText|GrayText|Highlight|HighlightText|LinkText|Mark|MarkText|VisitedText)/i.test(
				value
			) &&
			!/(^|\s)(ActiveText|ButtonBorder|ButtonFace|ButtonText|Canvas|CanvasText|Field|FieldText|GrayText|Highlight|HighlightText|LinkText|Mark|MarkText|VisitedText)(\s!important)?(;?$|\s)/i.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(ActiveBorder|ActiveCaption|AppWorkspace|Background|ButtonHighlight|ButtonShadow|CaptionText|InactiveBorder|InactiveCaption|InactiveCaptionText|InfoBackground|InfoText|Menu|MenuText|Scrollbar|ThreeDDarkShadow|ThreeDFace|ThreeDHighlight|ThreeDLightShadow|ThreeDShadow|Window|WindowFrame|WindowText)/i.test(
				value
			) &&
			!/(^|\s)(ActiveBorder|ActiveCaption|AppWorkspace|Background|ButtonHighlight|ButtonShadow|CaptionText|InactiveBorder|InactiveCaption|InactiveCaptionText|InfoBackground|InfoText|Menu|MenuText|Scrollbar|ThreeDDarkShadow|ThreeDFace|ThreeDHighlight|ThreeDLightShadow|ThreeDShadow|Window|WindowFrame|WindowText)(\s!important)?(;?$|\s)/i.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(-moz-ButtonDefault|-moz-ButtonHoverFace|-moz-ButtonHoverText|-moz-CellHighlight|-moz-CellHighlightText|-moz-Combobox|-moz-ComboboxText|-moz-Dialog|-moz-DialogText|-moz-dragtargetzone|-moz-EvenTreeRow|-moz-html-CellHighlight|-moz-html-CellHighlightText|-moz-mac-accentdarkestshadow|-moz-mac-accentdarkshadow|-moz-mac-accentface|-moz-mac-accentlightesthighlight|-moz-mac-accentlightshadow|-moz-mac-accentregularhighlight|-moz-mac-accentregularshadow|-moz-mac-chrome-active|-moz-mac-chrome-inactive|-moz-mac-focusring|-moz-mac-menuselect|-moz-mac-menushadow|-moz-mac-menutextselect|-moz-mac-MenuHover|-moz-MenuHoverText|-moz-MenuBarText|-moz-MenuBarHoverText|-moz-nativehyperlinktext|-moz-OddTreeRow|-moz-win-communicationstext|-moz-win-mediatext|-moz-win-accentcolor|-moz-win-accentcolortext|-moz-activehyperlinttext|-moz-default-background-color|-moz-default-color|-moz-hyperlinktext|-moz-visitedhyperlinktext)/i.test(
				value
			) &&
			!/(^|\s)(-moz-ButtonDefault|-moz-ButtonHoverFace|-moz-ButtonHoverText|-moz-CellHighlight|-moz-CellHighlightText|-moz-Combobox|-moz-ComboboxText|-moz-Dialog|-moz-DialogText|-moz-dragtargetzone|-moz-EvenTreeRow|-moz-html-CellHighlight|-moz-html-CellHighlightText|-moz-mac-accentdarkestshadow|-moz-mac-accentdarkshadow|-moz-mac-accentface|-moz-mac-accentlightesthighlight|-moz-mac-accentlightshadow|-moz-mac-accentregularhighlight|-moz-mac-accentregularshadow|-moz-mac-chrome-active|-moz-mac-chrome-inactive|-moz-mac-focusring|-moz-mac-menuselect|-moz-mac-menushadow|-moz-mac-menutextselect|-moz-mac-MenuHover|-moz-MenuHoverText|-moz-MenuBarText|-moz-MenuBarHoverText|-moz-nativehyperlinktext|-moz-OddTreeRow|-moz-win-communicationstext|-moz-win-mediatext|-moz-win-accentcolor|-moz-win-accentcolortext|-moz-activehyperlinttext|-moz-default-background-color|-moz-default-color|-moz-hyperlinktext|-moz-visitedhyperlinktext)(\s!important)?(;?$|\s)/i.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			/none/.test(value) &&
			!/(^|\s)none\(.*\)(;?$|\s)/.test(value) &&
			!/(^|\s)none(\s!important)?(;?$|\s)/.test(value)
		) {
			isInvalidValue = true;
		}

		if (
			/fit-content/.test(value) &&
			!/(^|\s)fit-content\(.*\)(;?$|\s)/.test(value) &&
			!/(^|\s)fit-content(\s!important)?(;?$|\s)/.test(value)
		) {
			isInvalidValue = true;
		}

		if (
			/fit-content\(.*\)/.test(value) &&
			!/(^|\s)fit-content(;?$|\s)/.test(value) &&
			!/(^|\s)fit-content\(.*\)(\s!important)?(;?$|\s)/.test(value)
		) {
			isInvalidValue = true;
		}

		if (
			(/fit-content\(.*\)\sfit-content/.test(value) ||
				/fit-content\sfit-content\(.*\)/.test(value)) &&
			((!/(^|\s)fit-content(;?$|\s)/.test(value) &&
				!/(^|\s)fit-content(\s!important)?(;?$|\s)/.test(value)) ||
				(!/(^|\s)fit-content\(.*\)(;?$|\s)/.test(value) &&
					!/(^|\s)fit-content\(.*\)(\s!important)?(;?$|\s)/.test(value)))
		) {
			isInvalidValue = true;
		}

		if (
			/(^|\s)(dashed|dotted|double|groove|hidden|inset|outset|ridge|solid)/.test(
				value
			) &&
			!/(^|\s)(dashed|dotted|double|groove|hidden|inset|outset|ridge|solid)(\s!important)?(;?$|\s)/.test(
				value
			)
		) {
			isInvalidValue = true;
		}

		if (
			!!((value.match(/\)/g) || []).length - (value.match(/\(/g) || []).length)
		) {
			isInvalidValue = true;
		}

		if (
			finalReplacement !== text &&
			!isInvalidValue &&
			(!text.includes('!important') || /\!important;?$/.test(text))
		) {
			diagnostics.push({
				severity: vscode.DiagnosticSeverity.Warning,
				message: `🧠 ${finalReplacement} ⇔ ${text} 💪`,
				term: {
					found: text,
					replacement: finalReplacement,
				},
				code: 'physical-property-detected',
				source: 'Logical Properties',
				range,
			});
		}
	}

	return diagnostics;
}

/**
 * Called when various document events happen.
 *
 * @param {vscode.DiagnosticCollection} diagnosticCollection
 * @param {vscode.TextDocument} document
 * @returns {Promise<void>}
 */
async function documentEventHandler(diagnosticCollection, document) {
	if (document && document.uri.scheme === 'file') {
		diagnosticCollection.set(document.uri, await getDiagnostics(document));
	}
}

/**
 * A reference to the status bar item.
 *
 * @type {vscode.StatusBarItem}
 */
let statusBarItem;

/**
 * Allows the status bar item to be set in other modules.
 *
 * @param {vscode.StatusBarItem} item
 * @returns {void}
 */
function setStatusBarItem(item) {
	statusBarItem = item;
}

/**
 * Updates the status bar item.
 *
 * @returns {Promise<void>}
 */
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

module.exports = {
	documentEventHandler,
	statusBarItem,
	setStatusBarItem,
	updateStatusBarItem,
};
