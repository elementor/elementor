import { type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';

export type LlmDialectValidationResult = {
	valid: boolean;
	errors?: string[];
	jsonSchema?: JsonSchema7;
};

export const validateLlmJson = (
	_propType: PropType,
	_value: unknown
): LlmDialectValidationResult => {
	return { valid: true };
};

export const validateLlmSemantic = (
	_propType: PropType,
	_value: unknown
): LlmDialectValidationResult => {
	return { valid: true };
};
