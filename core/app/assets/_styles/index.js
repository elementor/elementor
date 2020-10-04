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
};
