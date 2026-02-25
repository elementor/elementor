import { validate, type ValidationError } from 'jsonschema';

import { type PropType } from '../types';
import { propTypeToJsonSchema } from './props-to-llm-schema';

/**
 * Detailed error information with nested anyOf variant errors
 */
export interface DetailedValidationError {
	path: ( string | number )[];
	message: string;
	schema?: unknown;
	instance?: unknown;
	name: string;
	/**
	 * If this was an anyOf failure, contains errors for each variant
	 */
	variants?: {
		discriminator: string;
		errors: DetailedValidationError[];
	}[];
}

/**
 * Recursively processes validation errors to provide detailed information about anyOf failures
 *
 * @param error The validation error to process
 */
function processValidationError( error: ValidationError ): DetailedValidationError {
	const detailed: DetailedValidationError = {
		path: error.path,
		message: error.message,
		schema: error.schema,
		instance: error.instance,
		name: error.name,
	};

	// If this is an anyOf error, re-validate against each variant to get nested errors
	if ( error.name === 'anyOf' && error.schema && typeof error.schema === 'object' && 'anyOf' in error.schema ) {
		const anyOfSchema = error.schema as { anyOf?: unknown[] };
		const variants = ( anyOfSchema.anyOf || [] ).map( ( variantSchema, idx ) => {
			// Re-validate the instance against this specific variant
			const variantResult = validate( error.instance, variantSchema );

			// Get discriminator from schema if available
			let discriminator = `variant-${ idx }`;
			if (
				variantSchema &&
				typeof variantSchema === 'object' &&
				'properties' in variantSchema &&
				variantSchema.properties &&
				typeof variantSchema.properties === 'object' &&
				'$$type' in variantSchema.properties
			) {
				const typeProperty = variantSchema.properties.$$type;
				if (
					typeProperty &&
					typeof typeProperty === 'object' &&
					'const' in typeProperty &&
					typeof typeProperty.const === 'string'
				) {
					discriminator = typeProperty.const;
				}
			}

			return {
				discriminator,
				errors: variantResult.errors.map( processValidationError ),
			};
		} );

		detailed.variants = variants;
	}

	return detailed;
}

/**
 * Formats detailed errors into a human-readable string
 * @param errors
 * @param indent
 */
function formatDetailedErrors( errors: DetailedValidationError[], indent = '' ): string {
	const lines: string[] = [];

	for ( const error of errors ) {
		const pathStr = error.path.length > 0 ? error.path.join( '.' ) : 'root';
		lines.push( `${ indent }Error at ${ pathStr }: ${ error.message }` );

		if ( error.variants && error.variants.length > 0 ) {
			lines.push( `${ indent }  Tried ${ error.variants.length } variant(s):` );
			for ( const variant of error.variants ) {
				lines.push( `${ indent }    - ${ variant.discriminator }:` );
				if ( variant.errors.length === 0 ) {
					lines.push( `${ indent }        (no errors - this variant matched!)` );
				} else {
					for ( const nestedError of variant.errors ) {
						const nestedPathStr = nestedError.path.length > 0 ? nestedError.path.join( '.' ) : 'root';
						lines.push( `${ indent }        ${ nestedPathStr }: ${ nestedError.message }` );

						// Recursively format nested variant errors
						if ( nestedError.variants && nestedError.variants.length > 0 ) {
							lines.push( formatDetailedErrors( [ nestedError ], `${ indent }        ` ) );
						}
					}
				}
			}
		}
	}

	return lines.join( '\n' );
}

export const validatePropValue = ( schema: PropType, value: unknown ) => {
	const jsonSchema = propTypeToJsonSchema( schema );
	if ( value === null ) {
		return {
			valid: true,
			errors: [],
			errorMessages: [],
			jsonSchema: JSON.stringify( propTypeToJsonSchema( schema ) ),
		};
	}
	const result = validate( value, jsonSchema );
	const detailedErrors = result.errors.map( processValidationError );
	return {
		valid: result.valid,
		errors: result.errors,
		errorMessages: formatDetailedErrors( detailedErrors ),
		jsonSchema: JSON.stringify( jsonSchema ),
	};
};

/**
 * Validates a prop value with detailed error reporting for anyOf failures
 *
 * This function provides enhanced error messages that show exactly which nested
 * properties failed validation in anyOf schemas, making debugging much easier.
 *
 * @param schema The PropType schema to validate against
 * @param value  The value to validate
 * @return Validation result with detailed error information
 */
export const validatePropValueDetailed = ( schema: PropType, value: unknown ) => {
	const jsonSchema = propTypeToJsonSchema( schema );
	const result = validate( value, jsonSchema );

	// Process all errors to add detailed anyOf information
	const detailedErrors = result.errors.map( processValidationError );

	return {
		valid: result.valid,
		errors: detailedErrors,
		errorMessages: detailedErrors.map( ( err ) => err.message ),
		formattedErrors: formatDetailedErrors( detailedErrors ),
		jsonSchema: JSON.stringify( jsonSchema ),
	};
};
