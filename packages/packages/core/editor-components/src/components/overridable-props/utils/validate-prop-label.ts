import { __ } from '@wordpress/i18n';

export const ERROR_MESSAGES = {
	EMPTY_NAME: __( 'Property name is required', 'elementor' ),
	DUPLICATE_NAME: __( 'Property name already exists', 'elementor' ),
} as const;

type ValidationResult = {
	isValid: boolean;
	errorMessage: string | null;
};

export function validatePropLabel( label: string, existingLabels: string[], currentLabel?: string ): ValidationResult {
	const trimmedLabel = label.trim();

	if ( ! trimmedLabel ) {
		return { isValid: false, errorMessage: ERROR_MESSAGES.EMPTY_NAME };
	}

	const normalizedLabel = trimmedLabel.toLowerCase();
	const normalizedCurrentLabel = currentLabel?.trim().toLowerCase();

	const isDuplicate = existingLabels.some( ( existingLabel ) => {
		const normalizedExisting = existingLabel.trim().toLowerCase();

		if ( normalizedCurrentLabel && normalizedExisting === normalizedCurrentLabel ) {
			return false;
		}

		return normalizedExisting === normalizedLabel;
	} );

	if ( isDuplicate ) {
		return { isValid: false, errorMessage: ERROR_MESSAGES.DUPLICATE_NAME };
	}

	return { isValid: true, errorMessage: null };
}
