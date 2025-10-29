import { type DisplayConditionsPropValue } from '@elementor/editor-props';

import { createTransformer } from '../create-transformer';

// TODO: Implement this transformer
export const displayConditionsTransformer = createTransformer( ( values: DisplayConditionsPropValue[] ) => {
	return values
		.map( ( value ) => {
			return value.value;
		} )
		.join( ' ' );
} );
