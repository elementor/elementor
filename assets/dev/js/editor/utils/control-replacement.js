/**
 * Check if the new control value is empty.
 *
 * @since 3.16.0
 *
 * @param {Object} newProps New control value.
 * @param {Object} value    Current control value.
 *
 * @return {boolean} Whether the new control value is empty.
 */

export function areNewControlValuesEmpty ( newProps, value ) {
	let isEmpty = false;

	_.each( newProps, function( newProp ) {
		if ( value[ newProp ] === '' ) {
			isEmpty = true;
			return isEmpty;
		}
	} );

	return isEmpty;
}

/**
 * Update new control with old control values.
 *
 *
 * @param {Object} oldControlValues Old control values.
 * @param {Object} control          Control.
 * @param {Object} value            Current control value.
 */
export function updateNewControlWithOldControlValues ( oldControlValues, control, value ) {
	const oldControlValue = oldControlValues[control.old_format.old_prop];
	const oldControlUnit = oldControlValues.unit

	if ( !! oldControlValue ) {
		value.unit = oldControlUnit;
		_.each( control.old_format.new_props, ( newProp ) => {
			value[ newProp ] = oldControlValue;
		} );
	}
}

/**
 * Get old control name.
 *
 * @param control
 */
export function getOldControlName ( control ) {
	let oldControlName = control.old_format.name;
	const currentControlDevice = control.name.split('_'),
		device = currentControlDevice[currentControlDevice.length - 1],
		activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList();

	if( activeBreakpoints.includes( device ) ) {
		oldControlName = control.old_format.name + '_' + device;
	}

	return oldControlName;
}
