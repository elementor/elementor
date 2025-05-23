/**
 * Generate a mapping object for responsive controls.
 *
 * Usage:
 *  1. responsive( 'old_key', 'new_key' );
 *  2. responsive( 'old_key', ( { key, value, deviceValue, settings, breakpoint } ) => { return [ key, value ] } );
 *
 * @param {string}            key   - Control name without device suffix.
 * @param {string | Function} value - New control name without device suffix, or a callback.
 *
 * @return {Object} mapping object
 */
export function responsive( key, value ) {
	const breakpoints = [
		'', // For desktop.
		...Object.keys( elementorFrontend.config.responsive.activeBreakpoints ),
	];

	return Object.fromEntries( breakpoints.map( ( breakpoint ) => {
		const deviceKey = getDeviceKey( key, breakpoint );

		// Simple responsive rename with string:
		if ( 'string' === typeof value ) {
			const newDeviceKey = getDeviceKey( value, breakpoint );

			return [
				deviceKey,
				( { settings } ) => [ newDeviceKey, settings[ deviceKey ] ],
			];
		}

		// Advanced responsive rename with callback:
		return [ deviceKey, ( { settings, value: desktopValue } ) => value( {
			key,
			deviceKey,
			value: desktopValue,
			deviceValue: settings[ deviceKey ],
			settings,
			breakpoint,
		} ) ];
	} ) );
}

/**
 * Get a setting key for a device.
 *
 * Examples:
 *  1. getDeviceKey( 'some_control', 'mobile' ) => 'some_control_mobile'.
 *  2. getDeviceKey( 'some_control', '' ) => 'some_control'.
 *
 * @param {string} key        - Setting key.
 * @param {string} breakpoint - Breakpoint name.
 *
 * @return {string} device key
 */
export function getDeviceKey( key, breakpoint ) {
	return [ key, breakpoint ].filter( ( v ) => !! v ).join( '_' );
}
