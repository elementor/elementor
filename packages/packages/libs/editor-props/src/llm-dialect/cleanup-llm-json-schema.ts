import { type JsonSchema7 } from '../utils/prop-json-schema';
import { LLMDialectAdapter } from './llm-prop-schema';

const isJsonSchemaObject = ( value: unknown ): value is JsonSchema7 =>
	typeof value === 'object' && value !== null && ! Array.isArray( value );

const mergeDescriptions = ( parentDescription: unknown, branchDescription: unknown ): string | undefined => {
	const parent = typeof parentDescription === 'string' ? parentDescription : undefined;
	const branch = typeof branchDescription === 'string' ? branchDescription : undefined;

	if ( ! parent ) {
		return branch;
	}

	if ( ! branch ) {
		return parent;
	}

	if ( parent === branch ) {
		return parent;
	}

	return `${ parent } ${ branch }`;
};

const unwrapSingleCombinator = ( schema: JsonSchema7 ): JsonSchema7 | null => {
	const branches = schema.oneOf ?? schema.anyOf;

	if ( ! Array.isArray( branches ) || branches.length !== 1 ) {
		return null;
	}

	const branch = structuredClone( branches[ 0 ] );
	const mergedDescription = mergeDescriptions( schema.description, branch.description );

	if ( mergedDescription === undefined ) {
		delete branch.description;
	} else {
		branch.description = mergedDescription;
	}

	return branch;
};

const cleanupLlmJsonSchemaNode = ( schema: JsonSchema7 ): JsonSchema7 => {
	const result = structuredClone( schema );

	if ( result.properties ) {
		result.properties = Object.fromEntries(
			Object.entries( result.properties ).map( ( [ key, value ] ) => [ key, cleanupLlmJsonSchema( value ) ] )
		);
	}

	if ( isJsonSchemaObject( result.items ) ) {
		result.items = cleanupLlmJsonSchema( result.items );
	}

	if ( Array.isArray( result.oneOf ) ) {
		result.oneOf = result.oneOf.map( cleanupLlmJsonSchema );
	}

	if ( Array.isArray( result.anyOf ) ) {
		result.anyOf = result.anyOf.map( cleanupLlmJsonSchema );
	}

	return unwrapSingleCombinator( result ) ?? result;
};

export const cleanupLlmJsonSchema = ( schema: JsonSchema7 ): JsonSchema7 => cleanupLlmJsonSchemaNode( schema );

export function registerSchemaCleanupLlmDialectAdapter() {
	LLMDialectAdapter.registerSchemaCleanup( cleanupLlmJsonSchema );
}
