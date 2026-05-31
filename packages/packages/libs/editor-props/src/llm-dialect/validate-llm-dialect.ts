import { validate } from 'jsonschema';

import { type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { ensureLlmDialect } from '../utils/prop-values-llm-tree';
import { propTypeToLlmJsonSchema } from '../utils/props-to-llm-schema';
import { type LlmDialectSchemaContext } from './llm-prop-schema';

export type LlmDialectValidationResult = {
	valid: boolean;
	errors?: string[];
	jsonSchema?: JsonSchema7;
};

export type ValidateLlmJsonOptions = LlmDialectSchemaContext;

const formatValidationErrors = ( errors: ReturnType< typeof validate >[ 'errors' ] ): string[] =>
	errors.map( ( error ) => {
		const path = error.path.length > 0 ? error.path.join( '.' ) : 'root';
		return `${ path }: ${ error.message }`;
	} );

export const validateLlmJson = (
	propType: PropType,
	value: unknown,
	options: ValidateLlmJsonOptions = { allowBindTo: true }
): LlmDialectValidationResult => {
	ensureLlmDialect();
	const jsonSchema = propTypeToLlmJsonSchema( propType, options );

	if ( value === null ) {
		return { valid: true, errors: [], jsonSchema };
	}

	const result = validate( value, jsonSchema );

	return {
		valid: result.valid,
		errors: formatValidationErrors( result.errors ),
		jsonSchema,
	};
};

export const validateLlmSemantic = ( propType: PropType, value: unknown ): LlmDialectValidationResult => {
	void propType;
	void value;
	return { valid: true };
};
