import { z } from '@elementor/schema';
import { __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { selectComponents } from '../store/store';

const NO_START_DIGIT_REGEX = /^(|[^0-9].*)$/;
const NO_SPACES_REGEX = /^\S*$/;
const NO_SPECIAL_CHARS_REGEX = /^(|[a-zA-Z0-9_-]+)$/;

export const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

export const componentNameSchema = z
	.string()
	.min( MIN_NAME_LENGTH, __( 'Component name is too short. Use at least 2 characters.', 'elementor' ) )
	.max( MAX_NAME_LENGTH, __( 'Component name is too long. Please keep it under 50 characters.', 'elementor' ) )
	.regex( NO_START_DIGIT_REGEX, __( 'Component name must start with a letter.', 'elementor' ) )
	.regex( NO_SPACES_REGEX, __( 'Component name can’t contain spaces.', 'elementor' ) )
	.regex(
		NO_SPECIAL_CHARS_REGEX,
		__( 'Component name can only use letters, numbers, dashes (-), and underscores (_).', 'elementor' )
	);

type ValidationResult = { isValid: true; errorMessage: null } | { isValid: false; errorMessage: string };

export function validateComponentName( label: string ): ValidationResult {
	const existingComponentTitles = selectComponents( getState() )?.map( ( { name } ) => name ) ?? [];

	const result = componentNameSchema
		.refine( ( value ) => ! existingComponentTitles.includes( value ), {
			message: __( 'This component name already exists. Please choose a unique name.', 'elementor' ),
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
