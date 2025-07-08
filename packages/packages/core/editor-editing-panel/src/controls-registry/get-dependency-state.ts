import { type DependencyEffect, type PropType, type PropValue, shouldApplyEffect } from '@elementor/editor-props';

export function getDisableState( propType: PropType, elementValues: PropValue ) {
	return getDependencyState( propType, elementValues, 'disable' );
}

export function getHiddenState( propType: PropType, elementValues: PropValue ) {
	return getDependencyState( propType, elementValues, 'hide' );
}

function getDependencyState( propType: PropType, elementValues: PropValue, effect: DependencyEffect ) {
	const dependencies = propType?.dependencies?.filter( ( { effect: depEffect } ) => depEffect === effect ) || [];

	if ( ! dependencies.length ) {
		return false;
	}

	if ( dependencies.length > 1 ) {
		throw new Error( `Multiple ${ effect } dependencies are not supported.` );
	}

	return shouldApplyEffect( dependencies[ 0 ], elementValues );
}
