import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

export const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

export const baseComponentSchema = z
	.string()
	.trim()
	.max( MAX_NAME_LENGTH, __( 'Component name is too long. Please keep it under 50 characters.', 'elementor' ) );

export const createBaseComponentSchema = ( existingNames: string[] ) => {
	return z.object( {
		componentName: baseComponentSchema.refine( ( value ) => ! existingNames.includes( value ), {
			message: __( 'Component name already exists', 'elementor' ),
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
