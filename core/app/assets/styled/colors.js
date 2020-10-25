const themeColors = require( './maps/colors/theme-colors' );
const tints = require( './maps/colors/tints' );

module.exports = {
	theme: ( key ) => {
		return themeColors[ key ] ? themeColors[ key ].hex : 'initial';
	},

	tints: ( key ) => {
		return tints[ key ] ? tints[ key ].hex : 'initial';
	},
};
