import { validate } from 'jsonschema';

import { type PropType, type PropValue } from '../types';
import { adjustLlmPropValueSchema } from './adjust-llm-prop-value-schema';
import { propTypeToJsonSchema } from './props-to-llm-schema';

type Resolvers = NonNullable< Parameters< typeof adjustLlmPropValueSchema >[ 1 ] >[ 'transformers' ];

export const validatePropValue = ( schema: PropType, value: unknown, transformers: Resolvers = {} ) => {
	const jsonSchema = propTypeToJsonSchema( schema );
	const resultForValue = validate( value, jsonSchema );
	if ( ! resultForValue.valid ) {
		return {
			valid: false,
			errors: resultForValue.errors,
			errorMessages: resultForValue.errors.map( ( err ) => err.message ),
			value: value as PropValue,
			jsonSchema: JSON.stringify( jsonSchema ),
		};
	}
	const adjustedValue = adjustLlmPropValueSchema( value as PropValue, { transformers } );
	const resultForAdjusted = validate( adjustedValue, jsonSchema );
	const result = resultForAdjusted.valid ? resultForAdjusted : resultForValue;
	return {
		valid: result.valid,
		errors: result.errors,
		errorMessages: result.errors.map( ( err ) => err.message ),
		value: adjustedValue,
		jsonSchema: JSON.stringify( jsonSchema ),
	};
};
