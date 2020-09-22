import themeColors from 'elementor-styles/maps/colors/theme-colors.js';
import tints from 'elementor-styles/maps/colors/tints.js';

export default class Colors {
	static theme( key ) {
		return themeColors[ key ] ? themeColors[ key ].hex : 'initial';
	}

	static tints( key ) {
		return tints[ key ] ? tints[ key ].hex : 'initial';
	}
}
