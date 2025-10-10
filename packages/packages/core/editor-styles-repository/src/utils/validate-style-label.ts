import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

import { ELEMENTS_STYLES_RESERVED_LABEL } from '../providers/document-elements-styles-provider';
import { stylesRepository } from '../styles-repository';

const NO_START_DIGIT_REGEX = /^(|[^0-9].*)$/;
const NO_SPACES_REGEX = /^\S*$/;
const NO_SPECIAL_CHARS_REGEX = /^(|[a-zA-Z0-9_-]+)$/;
const NO_DOUBLE_HYPHEN_START_REGEX = /^(?!--).*/;
const NO_HYPHEN_DIGIT_START_REGEX = /^(?!-[0-9])/;

const RESERVED_CLASS_NAMES = [ 'container' ];

const schema = z
	.string()
	.max( 50, __( 'Class name is too long. Please keep it under 50 characters.', 'elementor' ) )
	.regex( NO_START_DIGIT_REGEX, __( 'Class names must start with a letter.', 'elementor' ) )
	.regex( NO_SPACES_REGEX, __( 'Class names can’t contain spaces.', 'elementor' ) )
	.regex(
		NO_SPECIAL_CHARS_REGEX,
		__( 'Class names can only use letters, numbers, dashes (-), and underscores (_).', 'elementor' )
	)
	.regex( NO_DOUBLE_HYPHEN_START_REGEX, __( 'Double hyphens are reserved for custom properties.', 'elementor' ) )
	.regex(
		NO_HYPHEN_DIGIT_START_REGEX,
		__( 'Class names can’t start with a hyphen followed by a number.', 'elementor' )
	)
	.refine( ( value ) => ! RESERVED_CLASS_NAMES.includes( value ), {
		message: __( 'This name is reserved and can’t be used. Try something more specific.', 'elementor' ),
	} );

type ValidationEvent = 'inputChange' | 'create' | 'rename';
type ValidationResult = { isValid: true; errorMessage: null } | { isValid: false; errorMessage: string };

export function validateStyleLabel( label: string, event: ValidationEvent | 'rename' ): ValidationResult {
	const existingLabels = new Set( [
		ELEMENTS_STYLES_RESERVED_LABEL,
		...stylesRepository.all().map( ( styleDef ) => styleDef.label.toLowerCase() ),
	] );

	const fullValidationEvent = [ 'create', 'rename' ].includes( event );

	const result = schema
		.refine( ( value ) => ! ( fullValidationEvent && value.length < 2 ), {
			message: __( 'Class name is too short. Use at least 2 characters.', 'elementor' ),
		} )
		.refine( ( value ) => ! ( fullValidationEvent && existingLabels.has( value ) ), {
			message: __( 'This class name already exists. Please choose a unique name.', 'elementor' ),
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
