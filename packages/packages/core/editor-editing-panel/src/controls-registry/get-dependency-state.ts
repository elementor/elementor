import { type PropType, type PropValue, shouldApplyEffect } from '@elementor/editor-props';

export function getDependencyState( propType: PropType, elementValues: PropValue ) {
	return propType?.dependencies?.terms.length ? shouldApplyEffect( propType?.dependencies, elementValues ) : false;
}
