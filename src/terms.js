/**
 * @typedef Term
 * @type {object}
 * @property {string} property - the property that is a physical property to search for.
 * @property {string} [value] - the value that is a physical property to search for.
 * @property {string} replacement - the logical property replacement.
 */

/** @type {Term[]} */
const TERMS = [
	// FLOAT
	{
		property: 'float',
		value: 'left',
		replacement: 'inline-start',
	},
	{
		property: 'float',
		value: 'right',
		replacement: 'inline-end',
	},
	{
		property: 'clear',
		value: 'left',
		replacement: 'inline-start',
	},
	{
		property: 'clear',
		value: 'right',
		replacement: 'inline-end',
	},
	// TEXT ALIGN
	{
		property: 'text-align',
		value: 'left',
		replacement: 'start',
	},
	{
		property: 'text-align',
		value: 'right',
		replacement: 'end',
	},
	// INSET
	{
		property: 'left',
		replacement: 'inset-inline-start',
	},
	{
		property: 'right',
		replacement: 'inset-inline-end',
	},
	{
		property: 'top',
		replacement: 'inset-block-start',
	},
	{
		property: 'bottom',
		replacement: 'inset-block-end',
	},
	// SIZE
	{
		property: 'width',
		replacement: 'inline-size',
	},
	{
		property: 'height',
		replacement: 'block-size',
	},
	{
		property: 'min-width',
		replacement: 'min-inline-size',
	},
	{
		property: 'min-height',
		replacement: 'min-block-size',
	},
	{
		property: 'max-width',
		replacement: 'max-inline-size',
	},
	{
		property: 'max-height',
		replacement: 'max-block-size',
	},
	// MARGINS
	{
		property: 'margin-left',
		replacement: 'margin-inline-start',
	},
	{
		property: 'margin-right',
		replacement: 'margin-inline-end',
	},
	{
		property: 'margin-top',
		replacement: 'margin-block-start',
	},
	{
		property: 'margin-bottom',
		replacement: 'margin-block-end',
	},
	// PADDINGS
	{
		property: 'padding-left',
		replacement: 'padding-inline-start',
	},
	{
		property: 'padding-right',
		replacement: 'padding-inline-end',
	},
	{
		property: 'padding-top',
		replacement: 'padding-block-start',
	},
	{
		property: 'padding-bottom',
		replacement: 'padding-block-end',
	},
	// BORDERS
	{
		property: 'border-left-width',
		replacement: 'border-inline-start-width',
	},
	{
		property: 'border-right-width',
		replacement: 'border-inline-end-width',
	},
	{
		property: 'border-top-width',
		replacement: 'border-block-start-width',
	},
	{
		property: 'border-bottom-width',
		replacement: 'border-block-end-width',
	},
	{
		property: 'border-left-color',
		replacement: 'border-inline-start-color',
	},
	{
		property: 'border-right-color',
		replacement: 'border-inline-end-color',
	},
	{
		property: 'border-top-color',
		replacement: 'border-block-start-color',
	},
	{
		property: 'border-bottom-color',
		replacement: 'border-block-end-color',
	},
	{
		property: 'border-left-style',
		replacement: 'border-inline-start-style',
	},
	{
		property: 'border-right-style',
		replacement: 'border-inline-end-style',
	},
	{
		property: 'border-top-style',
		replacement: 'border-block-start-style',
	},
	{
		property: 'border-bottom-style',
		replacement: 'border-block-end-style',
	},
	{
		property: 'border-top-left-radius',
		replacement: 'border-start-start-radius',
	},
	{
		property: 'border-top-right-radius',
		replacement: 'border-end-start-radius',
	},
	{
		property: 'border-bottom-left-radius',
		replacement: 'border-start-end-radius',
	},
	{
		property: 'border-bottom-right-radius',
		replacement: 'border-end-end-radius',
	},
	{
		property: 'border-left',
		replacement: 'border-inline-start',
	},
	{
		property: 'border-right',
		replacement: 'border-inline-end',
	},
	{
		property: 'border-top',
		replacement: 'border-block-start',
	},
	{
		property: 'border-bottom',
		replacement: 'border-block-end',
	},
];

module.exports = TERMS;
