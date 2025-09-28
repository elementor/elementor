import { __, sprintf } from '@wordpress/i18n';

import { type TVariable, type TVariablesList } from '../storage';

export const ERROR_MESSAGES = {
	MISSING_VARIABLE_NAME: __( 'Give your variable a name.', 'elementor' ),
	MISSING_VARIABLE_VALUE: __( 'Add a value to complete your variable.', 'elementor' ),
	INVALID_CHARACTERS: __( 'Use letters, numbers, dashes (-), or underscores (_) for the name.', 'elementor' ),
	NO_NON_SPECIAL_CHARACTER: __( 'Names have to include at least one non-special character.', 'elementor' ),
	VARIABLE_LABEL_MAX_LENGTH: __( 'Keep names up to 50 characters.', 'elementor' ),
	DUPLICATED_LABEL: __( 'This variable name already exists. Please choose a unique name.', 'elementor' ),
	UNEXPECTED_ERROR: __( 'There was a glitch. Try saving your variable again.', 'elementor' ),
	BATCH: {
		// eslint-disable-next-line @wordpress/i18n-translator-comments
		DUPLICATED_LABELS: ( count: number ) => sprintf( __( 'We found %d duplicated name.', 'elementor' ), count ),
		UNEXPECTED_ERROR: __( 'The save didn’t go through.', 'elementor' ),
		DUPLICATED_LABEL_ACTION: __( 'Take me there', 'elementor' ),
		DUPLICATED_LABEL_ACTION_MESSAGE: __( 'Please rename the variables.', 'elementor' ),
		UNEXPECTED_ERROR_ACTION_MESSAGE: __( 'Try saving your variables again.', 'elementor' ),
	},
} as const;

export const VARIABLE_LABEL_MAX_LENGTH = 50;

type BatchErrorData = {
	[id: string]: {
		status?: number;
		message?: string;
	};
};
type ErrorResponse = {
	response?: {
		data?: {
			code?: string;
			data?: BatchErrorData;
		};
	};
};

export type ErrorAction = {
	label: string;
	message?: string;
	callback?: () => void;
	data?: {
		duplicatedIds?: string[];
	};
};

export type MappedError = {
	field: string;
	message: string;
	action?: ErrorAction;
};

export const mapServerError = ( error: ErrorResponse ): MappedError | undefined => {
	if ( error?.response?.data?.code === 'duplicated_label' ) {
		return {
			field: 'label',
			message: ERROR_MESSAGES.DUPLICATED_LABEL,
		};
	}

	if ( error?.response?.data?.code === 'batch_duplicated_label' ) {
		const errorData = error?.response?.data?.data ?? {};
		const count = Object.keys( errorData ).length;

		const duplicatedIds = Object.keys( errorData );

		return {
			field: 'label',
			message: ERROR_MESSAGES.BATCH.DUPLICATED_LABELS( count ),
			action: {
				label: ERROR_MESSAGES.BATCH.DUPLICATED_LABEL_ACTION,
				message: ERROR_MESSAGES.BATCH.DUPLICATED_LABEL_ACTION_MESSAGE,
				data: {
					duplicatedIds,
				},
			},
		};
	}

	if ( error?.response?.data?.code === 'batch_operation_failed' ) {
		return {
			field: 'label',
			message: ERROR_MESSAGES.BATCH.UNEXPECTED_ERROR,
		};
	}

	return undefined;
};

export const validateLabel = ( name: string, variables?: TVariablesList ): string => {
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

	if ( Object.values( variables ?? {} ).some( ( variable: TVariable ) => variable.label === name ) ) {
		return ERROR_MESSAGES.DUPLICATED_LABEL;
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
