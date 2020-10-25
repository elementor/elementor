const Colors = require('./colors');
const Spacing = require('./spacing');
const Direction = require('./direction');

module.exports = {
	themeColors: Colors.theme,
	tints: Colors.tints,
	darkTints: null,
	spacing: Spacing.get,
	type: null,
	direction: Direction.get,
	selectors: {
		dark: '.eps-theme-dark',
		ltr: ':not([dir=rtl])',
		rtl: '[dir=rtl]',
	}
};
