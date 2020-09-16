import themeColors from 'elementor-styles/maps/colors/theme-colors.js';

export default class Colors {
	static theme( key ) {
		return themeColors[ key ] ? themeColors[ key ].hex : 'initial';
	}

	static tints( key ) {

	}
}
