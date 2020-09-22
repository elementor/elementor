import Colors from 'elementor-styles/colors.js';
import Spacing from 'elementor-styles/spacing.js';
import Breakpoints from 'elementor-styles/breakpoints.js';
import Direction from 'elementor-styles/direction.js';
import Utils from 'elementor-styles/utils.js';

export default {
	themeColors: Colors.theme,
	tints: Colors.tints,
	darkTints: null,
	spacing: Spacing.get,
	type: null,
	breakpoints: Breakpoints.get,
	utils: Utils,
}

export const direction = ( value ) => Direction.get( value );
