import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

import { componentNameSchema, MIN_NAME_LENGTH } from '../../../utils/component-name-validation';

export const createBaseComponentSchema = ( existingNames: string[] ) => {
	return z.object( {
		componentName: componentNameSchema.refine( ( value ) => ! existingNames.includes( value ), {
			message: __( 'This component name already exists. Please choose a unique name.', 'elementor' ),
		} ),
	} );
};

export const createSubmitComponentSchema = ( existingNames: string[] ) => {
	const baseSchema = createBaseComponentSchema( existingNames );

	return baseSchema.extend( {
		componentName: baseSchema.shape.componentName
			.refine( ( value ) => value.length > 0, {
				message: __( 'Component name is required.', 'elementor' ),
			} )
			.refine( ( value ) => value.length >= MIN_NAME_LENGTH, {
				message: __( 'Component name is too short. Please enter at least 2 characters.', 'elementor' ),
			} ),
	} );
};
