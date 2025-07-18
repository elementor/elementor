import { __ } from '@wordpress/i18n';

export const ERROR_MESSAGES = {
	MISSING_VARIABLE_NAME: __( 'Give your variable a name.', 'elementor' ),
	MISSING_VARIABLE_VALUE: __( 'Add a value to complete your variable.', 'elementor' ),
	INVALID_CHARACTERS: __( 'Use letters, numbers, dashes (-), or underscores (_) for the name.', 'elementor' ),
	NO_NON_SPECIAL_CHARACTER: __( 'Names have to include at least one non-special character.', 'elementor' ),
	VARIABLE_LABEL_MAX_LENGTH: __( 'Keep names up to 50 characters.', 'elementor' ),
	DUPLICATED_LABEL: __( 'This variable name already exists. Please choose a unique name.', 'elementor' ),
	UNEXPECTED_ERROR: __( 'There was a glitch. Try saving your variable again.', 'elementor' ),
} as const;

export const VARIABLE_LABEL_MAX_LENGTH = 50;

export const validateLabel = ( name: string ): string => {
	if ( ! name.trim() ) {
		return ERROR_MESSAGES.MISSING_VARIABLE_NAME;
	}

	const allowedChars = /^[a-zA-Z0-9_-]+$/;
	if ( ! allowedChars.test( name ) ) {
		return ERROR_MESSAGES.INVALID_CHARACTERS;
	}

	const hasAlphanumeric = /[a-zA-Z0-9]/;
	if ( ! hasAlphanumeric.test( name ) ) {
		return ERROR_MESSAGES.NO_NON_SPECIAL_CHARACTER;
	}

	if ( VARIABLE_LABEL_MAX_LENGTH < name.length ) {
		return ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH;
	}

	return '';
};

export const labelHint = ( name: string ): string => {
	const hintThreshold = VARIABLE_LABEL_MAX_LENGTH * 0.8 - 1;
	if ( hintThreshold < name.length ) {
		return ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH;
	}

	return '';
};

export const validateValue = ( value: string ): string => {
	if ( ! value.trim() ) {
		return ERROR_MESSAGES.MISSING_VARIABLE_VALUE;
	}

	return '';
};
