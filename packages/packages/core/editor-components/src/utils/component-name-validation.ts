import { __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { baseComponentSchema, MIN_NAME_LENGTH } from '../components/create-component-form/utils/component-form-schema';
import { selectComponents } from '../store/store';

type ValidationResult = { isValid: true; errorMessage: null } | { isValid: false; errorMessage: string };

export function validateComponentName( label: string ): ValidationResult {
	const existingComponentTitles = selectComponents( getState() )?.map( ( { name } ) => name ) ?? [];

	const result = baseComponentSchema
		.refine( ( value ) => ! existingComponentTitles.includes( value ), {
			message: __( 'This component name already exists. Please choose a unique name.', 'elementor' ),
		} )
		.refine( ( value ) => value.length > 0, {
			message: __( 'Component name is required.', 'elementor' ),
		} )
		.refine( ( value ) => value.length >= MIN_NAME_LENGTH, {
			message: __( 'Component name is too short. Please enter at least 2 characters.', 'elementor' ),
		} )
		.safeParse( label.toLowerCase() );

	if ( result.success ) {
		return {
			isValid: true,
			errorMessage: null,
		};
	}

	return {
		isValid: false,
		errorMessage: result.error.format()._errors[ 0 ],
	};
}
// TODO: validate component name with createSubmitComponentSchema in the future
