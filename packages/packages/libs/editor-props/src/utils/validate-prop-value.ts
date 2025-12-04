import { validate } from 'jsonschema';

import { type PropType } from '../types';
import { propTypeToJsonSchema } from './props-to-llm-schema';

export const validatePropValue = ( schema: PropType, value: unknown ) => {
	const jsonSchema = propTypeToJsonSchema( schema );
	const result = validate( value, jsonSchema );
	return {
		valid: result.valid,
		errors: result.errors,
		errorMessages: result.errors.map( ( err ) => err.message ),
		value,
		jsonSchema: JSON.stringify( jsonSchema ),
	};
};
