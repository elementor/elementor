import Colors from 'elementor-styles/colors.js';
import Spacing from 'elementor-styles/spacing.js';
import Breakpoints from 'elementor-styles/breakpoints.js';
import Direction from 'elementor-styles/direction.js';

export default {
	themeColors: Colors.theme,
	tints: Colors.tints,
	darkTints: null,
	spacing: Spacing.get,
	type: null,
	breakpoints: Breakpoints,
	direction: Direction.get,
}
