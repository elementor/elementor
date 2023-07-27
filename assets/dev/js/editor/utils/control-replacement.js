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

export const areNewControlValuesEmpty = ( newProps, value ) => {
	let isEmpty = false;

	_.each( newProps, function( newProp ) {
		if ( value[ newProp ] === '' ) {
			isEmpty = true;
			return isEmpty;
		}
	} );

	return isEmpty;
}

export const updateNewControlWithOldControlValues = ( oldControlValues, control, value ) => {
	const oldControlValue = oldControlValues[control.old_format.old_prop];
	const oldControlUnit = oldControlValues.unit

	if ( !! oldControlValue ) {
		value.unit = oldControlUnit;
		_.each( control.old_format.new_props, ( newProp ) => {
			value[ newProp ] = oldControlValue;
		} );
	}
}


