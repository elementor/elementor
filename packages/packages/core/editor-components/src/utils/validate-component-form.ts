import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

import { type FormErrors, type FormValues } from '../types';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

export const validateComponentForm = (
	values: FormValues,
	existingNames: string[],
	event: 'change' | 'submit'
):
	| { success: false; parsedValues?: never; errors: FormErrors }
	| { success: true; parsedValues: FormValues; errors?: never } => {
	const schema: z.ZodType< FormValues > = z.object( {
		componentName: z
			.string()
			.trim()
			.max(
				MAX_NAME_LENGTH,
				__( 'Component name is too long. Please keep it under 50 characters.', 'elementor' )
			)
			.refine(
				( value ) => {
					if ( event === 'submit' ) {
						return value.length > 0;
					}

					return true;
				},
				{
					message: __( 'Component name is required.', 'elementor' ),
				}
			)
			.refine(
				( value ) => {
					if ( event === 'submit' ) {
						return value.length >= MIN_NAME_LENGTH;
					}

					return true;
				},
				{
					message: __( 'Component name is too short. Please enter at least 2 characters.', 'elementor' ),
				}
			)
			.refine( ( value ) => ! existingNames.includes( value ), {
				message: __( 'Component name already exists', 'elementor' ),
			} ),
	} );

	const result = schema.safeParse( values );

	if ( result.success ) {
		return { success: true, parsedValues: result.data };
	}

	const errors = {} as FormErrors;

	( Object.entries( result.error.formErrors.fieldErrors ) as Array< [ keyof FormValues, string[] ] > ).forEach(
		( [ field, error ] ) => {
			errors[ field ] = error[ 0 ];
		}
	);

	return { success: false, errors };
};
