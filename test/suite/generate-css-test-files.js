const fs = require('fs');
const path = require('path');

let args = process.argv.slice(2);

args = args
	.map((arg) => {
		if (arg.startsWith('-') && !arg.startsWith('--') && arg.length > 2) {
			const newArgs = arg
				.split('')
				.slice(1)
				.map((char) => `-${char}`);

			return newArgs;
		}

		return arg;
	})
	.flat();

const MODIFIERS = ['!important'];

// ∅ === '' aka nothing
const TEST_PREFIXES = [';', '∅', ' ', '\t', '\n'];
const TEST_POSTFIXES = [';', '∅', ' ', '\t', '\n'];
const TEST_INVALID_PRE_POST_FIXES = [
	'@',
	'#',
	'*',
	',',
	'/',
	'~',
	'`',
	'!',
	'111111', // Use 6 digits to ensure that `#fff111111` is not a valid hex color
	'$',
	'%',
	'^',
	'&',
	'(',
	')',
	'-',
	'_',
	'+',
	'=',
	'{',
	'[',
	'}',
	']',
	'|',
	'\\',
	':',
	'"',
	"'",
	'<',
	'>',
	'.',
	'?',
	'z',
	'🚫', // emoji
	'非', // Unicode
];

const getFriendlyText = (text) => {
	return text
		.replace(/~/g, '～')
		.replace(/`/g, '`')
		.replace(/!/g, '！')
		.replace(/@/g, '＠')
		.replace(/#/g, '＃')
		.replace(/\$/g, '＄')
		.replace(/%/g, '％')
		.replace(/\^/g, '＾')
		.replace(/&/g, '﹠')
		.replace(/\*/g, '﹡')
		.replace(/\(/g, '﹙')
		.replace(/\)/g, '﹚')
		.replace(/-/g, '⎯')
		.replace(/_/g, '＿')
		.replace(/\+/g, '﹢')
		.replace(/=/g, '＝')
		.replace(/\{/g, '﹛')
		.replace(/\[/g, '［')
		.replace(/\}/g, '﹜')
		.replace(/\]/g, '］')
		.replace(/\|/g, '｜')
		.replace(/\\/g, '﹨')
		.replace(/:/g, '：')
		.replace(/;/g, ';')
		.replace(/"/g, '＂')
		.replace(/'/g, '＇')
		.replace(/</g, '﹤')
		.replace(/,/g, '﹐')
		.replace(/>/g, '﹥')
		.replace(/\./g, '․')
		.replace(/\?/g, '？')
		.replace(/\//g, '／')
		.replace(/\s/g, '⎵')
		.replace(
			/[^a-zA-Z0-9∅～`！＠＃＄％＾﹠﹡﹙﹚⎯＿﹢＝﹛［﹜］｜﹨：;＂＇﹤﹐﹥․？／⎵🚫非]/g,
			'⧳'
		);
};

const getFriendlyName = ({
	property,
	value,
	prefix = null,
	postfix = null,
	modifier = null,
	validity = null,
}) => {
	const names = [getFriendlyText(property), getFriendlyText(value)];

	if (modifier !== null) {
		names.push(getFriendlyText(modifier));
	}

	if (prefix !== null) {
		names.push(getFriendlyText(prefix));
	}

	if (postfix !== null) {
		names.push(getFriendlyText(postfix));
	}

	if (validity) {
		names.push(getFriendlyText(validity));
	}

	return names.join('-');
};

const getFileName = ({
	property,
	value,
	prefix = null,
	postfix = null,
	modifier = null,
	validity = null,
}) => {
	return `${getFriendlyName({
		property,
		value,
		prefix,
		postfix,
		modifier,
		validity,
	})}.css`;
};

const generateTests = () => {
	const SUITES = [
		{
			directory: 'float',
			additionalProperties: ['float'],
			logicalValues: ['left', 'right'],
			additionalValues: ['none', 'inline-start', 'inline-end'],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'clear',
			additionalProperties: ['clear'],
			logicalValues: ['left', 'right'],
			additionalValues: ['none', 'both', 'inline-start', 'inline-end'],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'text-align',
			additionalProperties: ['text-align'],
			logicalValues: ['left', 'right'],
			// https://drafts.csswg.org/css-text-4/#character-alignment
			logicalValuesNotBrowserImplemented: [
				"'.' left",
				"'.' right",
				'`.` left',
				'`.` right',
				'"." left',
				'"." right',
			],
			additionalValues: [
				'center',
				'justify',
				'justify-all',
				'match-parent',
				'start',
				'end',
			],
			// https://drafts.csswg.org/css-text-4/#character-alignment
			additionalValuesNotBrowserImplemented: [
				'"."',
				"'.'",
				'`.`',
				'"." center',
				'"." start',
				'"." end',
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
			nonStandardValues: [
				'-moz-center',
				'-moz-left',
				'-moz-right',
				'-webkit-center',
				'-webkit-left',
				'-webkit-right',
				'-webkit-auto',
				'-webkit-match-parent',
			],
		},
		{
			directory: 'inset',
			logicalProperties: ['left', 'right', 'top', 'bottom'],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'margin',
			logicalProperties: [
				'margin-left',
				'margin-right',
				'margin-top',
				'margin-bottom',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'padding',
			logicalProperties: [
				'padding-left',
				'padding-right',
				'padding-top',
				'padding-bottom',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'size',
			logicalProperties: [
				'height',
				'width',
				'min-height',
				'min-width',
				'max-height',
				'max-width',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'border',
			logicalProperties: [
				'border-bottom-width',
				'border-left-width',
				'border-right-width',
				'border-top-width',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
				'thin',
				'medium',
				'thick',
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'border',
			logicalProperties: [
				'border-bottom-color',
				'border-left-color',
				'border-right-color',
				'border-top-color',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// HWB
				'hwb(0, 0%, 100%)',
				'hwb(0 0% 100%)',
				'hwb(0, 0%, 100%, 0.5)',
				'hwb(0 0% 100% / 0.5)',
				// LAB
				'lab(0%, 0, 0)',
				'lab(0% 0 0 / 0.5)',
				// LCH
				'lch(0%, 0, 0)',
				'lch(0% 0 0 / 0.5)',
				// Slash
				'rgb(255 255 255 / 0.5)',
				'rgba(255 255 255 / 0.5)',
				'hsla(0 0% 100% / 0.5)',
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'border',
			logicalProperties: [
				'border-bottom-style',
				'border-left-style',
				'border-right-style',
				'border-top-style',
			],
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'border',
			logicalProperties: [
				'border-bottom',
				'border-left',
				'border-right',
				'border-top',
			],
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
		{
			directory: 'border',
			logicalProperties: [
				'border-top-left-radius',
				'border-bottom-left-radius',
				'border-top-right-radius',
				'border-bottom-right-radius',
			],
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units
			// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions
			// https://drafts.csswg.org/css-values-4/
			additionalValues: [
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
			],
			additionalValuesNotBrowserImplemented: [
				// Assumed that these can be used for inset properties:
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
				// Unsure on the following if they can be used for inset properties:
				'toggle(10px, 20px)',
				'mix(10%; 10px; 20px)',
				"round('nearest', 10.5px)", // === Math.round(10.5px)
				"round('up', 10.5px)", // === Math.ceil(10.5px)
				"round('down', 10.5px)", // === Math.floor(10.5px)
				"round('to-zero', 10.5px)", // === Math.trunc(10.5px)
			],
			globalValues: ['inherit', 'initial', 'revert', 'unset'],
		},
	];

	SUITES.forEach(
		({
			directory,
			logicalProperties = [],
			additionalProperties = [],
			logicalValues = [],
			logicalValuesNotBrowserImplemented = [],
			additionalValues = [],
			additionalValuesNotBrowserImplemented = [],
			globalValues = [],
			nonStandardValues = [],
		}) => {
			console.log(`Creating ${directory} directory...`);

			const directoryPath = path.join(
				__dirname,
				'test-files',
				'css',
				`${directory}`
			);

			if (!fs.existsSync(directoryPath)) {
				fs.mkdirSync(directoryPath, { recursive: true });
			}

			const properties = [...logicalProperties, ...additionalProperties];
			const values = [
				...logicalValues,
				...logicalValuesNotBrowserImplemented,
				...additionalValues,
				...additionalValuesNotBrowserImplemented,
				...globalValues,
				...nonStandardValues,
			];

			properties.forEach((property) => {
				values.forEach((value) => {
					if (value === 'none' && ['width', 'height'].includes(property)) {
						return;
					}

					['valid', 'invalid'].forEach((validity) => {
						const shouldBeFound =
							(logicalProperties.includes(property) ||
								logicalValues.includes(value)) &&
							!logicalValuesNotBrowserImplemented.includes(value) &&
							!additionalValuesNotBrowserImplemented.includes(value) &&
							validity === 'valid';
						let prefixes;
						let postfixes;
						if (validity === 'valid') {
							prefixes = TEST_PREFIXES;
							postfixes = TEST_POSTFIXES;
						} else {
							prefixes = TEST_INVALID_PRE_POST_FIXES;
							postfixes = TEST_INVALID_PRE_POST_FIXES;
						}

						let countExpected = 0;
						let data = '';

						let filename = getFileName({
							property,
							value,
							validity: validity === 'valid' ? validity : null,
						});

						if (shouldBeFound) {
							console.log(`Generating ${filename}...`);

							data += `.${getFriendlyName({
								property,
								value,
								validity,
							})} {
    ${property}: ${value};
}
`;
							if (shouldBeFound) {
								countExpected++;
							}

							data += '\n';

							MODIFIERS.forEach((modifier) => {
								data += `.${getFriendlyName({
									property,
									value,
									modifier,
									validity,
								})} {
	${property}: ${value} ${modifier};
}
`;

								if (shouldBeFound) {
									countExpected++;
								}

								data += '\n';
							});

							data = `/* Expected Diagnostic Count: ${countExpected} */\n\n${data}`;

							console.log(`Writing ${filename}...`);
							fs.writeFileSync(path.join(directoryPath, filename), data);
						}

						countExpected = 0;
						data = '';

						filename = getFileName({
							property,
							value,
							prefix: 'prefixes',
							validity: validity === 'valid' ? validity : null,
						});

						console.log(`Generating ${filename}...`);

						prefixes.forEach((prefix) => {
							data += `.${getFriendlyName({
								property,
								value,
								prefix,
								validity,
							})} {
    ${prefix === '∅' ? '' : prefix}${property}: ${value}
}
`;
							if (shouldBeFound) {
								countExpected++;
							}

							data += '\n';

							MODIFIERS.forEach((modifier) => {
								data += `.${getFriendlyName({
									property,
									value,
									prefix,
									modifier,
									validity,
								})} {
	${prefix === '∅' ? '' : prefix}${property}: ${value} ${modifier} 
}
`;

								if (shouldBeFound) {
									countExpected++;
								}

								data += '\n';
							});
						});

						data = `/* Expected Diagnostic Count: ${countExpected} */\n\n${data}`;

						console.log(`Writing ${filename}...`);
						fs.writeFileSync(path.join(directoryPath, filename), data);

						countExpected = 0;
						data = '';

						filename = getFileName({
							property,
							value,
							postfix: 'postfixes',
							validity: validity === 'valid' ? validity : null,
						});

						console.log(`Generating ${filename}...`);

						postfixes.forEach((postfix) => {
							data += `.${getFriendlyName({
								property,
								value,
								postfix,
								validity,
							})} {
	${property}: ${value}${postfix === '∅' ? '' : postfix}
}
`;

							if (shouldBeFound) {
								countExpected++;
							}

							data += '\n';

							MODIFIERS.forEach((modifier) => {
								data += `.${getFriendlyName({
									property,
									value,
									postfix,
									modifier,
									validity,
								})} {
	${property}: ${value} ${modifier}${postfix === '∅' ? '' : postfix}
}
`;

								if (shouldBeFound) {
									countExpected++;
								}

								data += '\n';
							});
						});

						data = `/* Expected Diagnostic Count: ${countExpected} */\n\n${data}`;

						console.log(`Writing ${filename}...`);
						fs.writeFileSync(path.join(directoryPath, filename), data);

						countExpected = 0;
						data = '';

						filename = getFileName({
							property,
							value,
							postfix: 'prefixes',
							prefix: 'postfixes',
							validity: validity === 'valid' ? validity : null,
						});

						console.log(`Generating ${filename}...`);

						prefixes.forEach((prefix) => {
							postfixes.forEach((postfix) => {
								data += `.${getFriendlyName({
									property,
									value,
									prefix,
									postfix,
									validity,
								})} {
	${prefix === '∅' ? '' : prefix}${property}: ${value}${
									postfix === '∅' ? '' : postfix
								}
}
`;

								if (shouldBeFound) {
									countExpected++;
								}

								data += '\n';

								MODIFIERS.forEach((modifier) => {
									data += `.${getFriendlyName({
										property,
										value,
										prefix,
										postfix,
										modifier,
										validity,
									})} {
	${prefix === '∅' ? '' : prefix}${property}: ${value} ${modifier}${
										postfix === '∅' ? '' : postfix
									}
}
`;

									if (shouldBeFound) {
										countExpected++;
									}

									data += '\n';
								});
							});
						});

						data = `/* Expected Diagnostic Count: ${countExpected} */\n\n${data}`;

						console.log(`Writing ${filename}...`);
						fs.writeFileSync(path.join(directoryPath, filename), data);
					});
				});
			});
		}
	);
};

if (
	args.includes('generate') ||
	args.includes('-g') ||
	args.includes('--generate')
) {
	generateTests();
}

module.exports = {
	getFriendlyText,
	getFriendlyName,
	getFileName,
};
