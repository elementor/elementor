import { validate } from 'jsonschema';

import { type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { propTypeToLlmJsonSchema } from '../utils/props-to-llm-schema';
import { ensureLlmDialect } from './init';

export type LlmDialectValidationResult = {
	valid: boolean;
	errors?: string[];
	jsonSchema?: JsonSchema7;
};

const formatValidationErrors = ( errors: ReturnType< typeof validate >[ 'errors' ] ): string[] =>
	errors.map( ( error ) => {
		const path = error.path.length > 0 ? error.path.join( '.' ) : 'root';
		return `${ path }: ${ error.message }`;
	} );

export const validateLlmJson = ( propType: PropType, value: unknown ): LlmDialectValidationResult => {
	ensureLlmDialect();
	const jsonSchema = propTypeToLlmJsonSchema( propType );

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
