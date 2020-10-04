const spacing = require( './maps/spacing/spacing' );

module.exports = {
	get: ( key ) => {
		return spacing.values[ key ] && ( spacing.values[ key ] * spacing.base.spacer ) + spacing.base.units;
	},
};
