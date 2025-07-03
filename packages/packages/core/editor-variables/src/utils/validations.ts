import { __ } from '@wordpress/i18n';

export const VARIABLE_LABEL_MAX_LENGTH = 50;

export const validateLabel = ( name: string ): string => {
	if ( ! name.trim() ) {
		return __( 'Missing variable name.', 'elementor' );
	}

	const allowedChars = /^[a-zA-Z0-9_-]+$/;
	if ( ! allowedChars.test( name ) ) {
		return __( 'Names can only use letters, numbers, dashes (-) and underscores (_).', 'elementor' );
	}

	const hasAlphanumeric = /[a-zA-Z0-9]/;
	if ( ! hasAlphanumeric.test( name ) ) {
		return __( 'Names have to include at least one non-special character.', 'elementor' );
	}

	if ( VARIABLE_LABEL_MAX_LENGTH < name.length ) {
		return __( 'Variable names can contain up to 50 characters.', 'elementor' );
	}

	return '';
};

export const labelHint = ( name: string ): string => {
	const hintThreshold = VARIABLE_LABEL_MAX_LENGTH * 0.8 - 1;
	if ( hintThreshold < name.length ) {
		return __( 'Variable names can contain up to 50 characters.', 'elementor' );
	}

	return '';
};

export const validateValue = ( value: string ): string => {
	if ( ! value.trim() ) {
		return __( 'Missing variable value.', 'elementor' );
	}

	return '';
};
