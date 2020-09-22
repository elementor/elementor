import breakpoints from 'elementor-styles/maps/breakpoints/breakpoints.js';

export default class Breakpoints {
	static get( key ) {
		return breakpoints[ key ] || breakpoints;
	}
}
