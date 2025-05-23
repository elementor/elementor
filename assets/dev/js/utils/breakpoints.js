/**
 * Breakpoints
 *
 * This utility class contains helper functions relating to Elementor's breakpoints system.
 *
 * @since 3.4.0
 */
export default class Breakpoints extends elementorModules.Module {
	constructor( responsiveConfig ) {
		super();

		// The passed config is either `elementor.config.responsive` or `elementorFrontend.config.responsive`
		this.responsiveConfig = responsiveConfig;
	}

	/**
	 * Get Active Breakpoints List
	 *
	 * Returns a flat array containing the active breakpoints/devices. By default, it returns the li
	 * the list ordered from smallest to largest breakpoint. If `true` is passed as a parameter, it reverses the order.
	 *
	 * @since 3.4.0
	 *
	 * @param {Object} args
	 */
	getActiveBreakpointsList( args = {} ) {
		const defaultArgs = {
			largeToSmall: false,
			withDesktop: false,
		};

		args = { ...defaultArgs, ...args };

		const breakpointKeys = Object.keys( this.responsiveConfig.activeBreakpoints );

		if ( args.withDesktop ) {
			// If there is an active 'widescreen' breakpoint, insert the artificial 'desktop' device below it.
			const widescreenIndex = breakpointKeys.indexOf( 'widescreen' ),
				indexToInsertDesktopDevice = -1 === widescreenIndex ? breakpointKeys.length : breakpointKeys.length - 1;

			breakpointKeys.splice( indexToInsertDesktopDevice, 0, 'desktop' );
		}

		if ( args.largeToSmall ) {
			breakpointKeys.reverse();
		}

		return breakpointKeys;
	}

	/**
	 * Get Active Breakpoint Values
	 *
	 * Returns a flat array containing the list of active breakpoint values, from smallest to largest.
	 *
	 * @since 3.4.0
	 */
	getBreakpointValues() {
		const { activeBreakpoints } = this.responsiveConfig,
			breakpointValues = [];

		Object.values( activeBreakpoints ).forEach( ( breakpointConfig ) => {
			breakpointValues.push( breakpointConfig.value );
		} );

		return breakpointValues;
	}

	/**
	 * Get Desktop Previous Device Key
	 *
	 * Returns the key of the device directly under desktop (can be 'tablet', 'tablet_extra', 'laptop').
	 *
	 * @since 3.4.0
	 *
	 * @return {string} device key
	 */
	getDesktopPreviousDeviceKey() {
		let desktopPreviousDevice = '';

		const { activeBreakpoints } = this.responsiveConfig,
			breakpointKeys = Object.keys( activeBreakpoints ),
			numOfDevices = breakpointKeys.length;

		if ( 'min' === activeBreakpoints[ breakpointKeys[ numOfDevices - 1 ] ].direction ) {
			// If the widescreen breakpoint is active, the device that's previous to desktop is the last one before
			// widescreen.
			desktopPreviousDevice = breakpointKeys[ numOfDevices - 2 ];
		} else {
			// If the widescreen breakpoint isn't active, we just take the last device returned by the config.
			desktopPreviousDevice = breakpointKeys[ numOfDevices - 1 ];
		}

		return desktopPreviousDevice;
	}

	/**
	 * Get Device Minimum Breakpoint
	 *
	 * Returns the minimum point in the device's display range. For each device, the minimum point of its display range
	 * is the max point of the device below it + 1px. For example, if the active devices are mobile, tablet,
	 * and desktop, and the mobile breakpoint is 767px, the minimum display point for tablet devices is 768px.
	 *
	 * @since 3.4.0
	 *
	 * @return {number|*} minimum breakpoint
	 */
	getDesktopMinPoint() {
		const { activeBreakpoints } = this.responsiveConfig,
			desktopPreviousDevice = this.getDesktopPreviousDeviceKey();

		return activeBreakpoints[ desktopPreviousDevice ].value + 1;
	}

	/**
	 * Get Device Minimum Breakpoint
	 *
	 * Returns the minimum point in the device's display range. For each device, the minimum point of its display range
	 * is the max point of the device below it + 1px. For example, if the active devices are mobile, tablet,
	 * and desktop, and the mobile breakpoint is 767px, the minimum display point for tablet devices is 768px.
	 *
	 * @since 3.4.0
	 *
	 * @param {string} device
	 * @return {number|*} minimum breakpoint
	 */
	getDeviceMinBreakpoint( device ) {
		if ( 'desktop' === device ) {
			return this.getDesktopMinPoint();
		}

		const { activeBreakpoints } = this.responsiveConfig,
			breakpointNames = Object.keys( activeBreakpoints );

		let minBreakpoint;

		if ( breakpointNames[ 0 ] === device ) {
			// For the lowest breakpoint, the min point is always 320.
			minBreakpoint = 320;
		} else if ( 'widescreen' === device ) {
			// Widescreen only has a minimum point. In this case, the breakpoint
			// value in the Breakpoints config is itself the device min point.
			if ( activeBreakpoints[ device ] ) {
				minBreakpoint = activeBreakpoints[ device ].value;
			} else {
				// If the widescreen breakpoint does not exist in the active breakpoints config (for example, in the
				// case this method runs as the breakpoint is being added), get the value from the full config.
				minBreakpoint = this.responsiveConfig.breakpoints.widescreen;
			}
		} else {
			const deviceNameIndex = breakpointNames.indexOf( device ),
				previousIndex = deviceNameIndex - 1;

			minBreakpoint = activeBreakpoints[ breakpointNames[ previousIndex ] ].value + 1;
		}

		return minBreakpoint;
	}

	/**
	 * Get Active Match Regex
	 *
	 * Returns a regular expression containing all active breakpoints prefixed with an underscore.
	 *
	 * @return {RegExp} Active Match Regex
	 */
	getActiveMatchRegex() {
		return new RegExp( this.getActiveBreakpointsList().map( ( device ) => '_' + device ).join( '|' ) + '$' );
	}
}
