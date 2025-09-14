import { type TVariable } from '../../storage';

export type VariableFormData = {
	label: string;
	value: string;
	type: string;
};

export type VariableValidationError = {
	field: keyof VariableFormData;
	message: string;
};

export type FieldError = {
	value: string;
	message: string;
};

export type VariableFieldErrors = {
	[ variableId: string ]: {
		label?: FieldError;
		value?: FieldError;
	};
};

export type SaveResult = {
	success: boolean;
	error?: string;
	watermark?: number;
	operations?: number;
};

export type DeleteConfirmationState = {
	id: string;
	label: string;
} | null;

export const isValidVariable = ( variable: unknown ): variable is TVariable => {
	return (
		typeof variable === 'object' &&
		variable !== null &&
		'type' in variable &&
		'label' in variable &&
		'value' in variable &&
		typeof ( variable as TVariable ).type === 'string' &&
		typeof ( variable as TVariable ).label === 'string' &&
		typeof ( variable as TVariable ).value === 'string'
	);
};

export const isValidVariableId = ( id: unknown ): id is string => {
	return typeof id === 'string' && id.length > 0;
};
