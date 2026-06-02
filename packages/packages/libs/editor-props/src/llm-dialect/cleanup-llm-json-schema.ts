import { type JsonSchema7 } from '../utils/prop-json-schema';

const mergeDescriptions = ( parentDescription?: string, branchDescription?: string ): string | undefined => {
	const descriptions = [ parentDescription, branchDescription ].filter( Boolean );

	if ( descriptions.length === 0 ) {
		return undefined;
	}

	return descriptions.join( ' ' );
};

const unwrapSingleBranch = ( schema: JsonSchema7, branchKey: 'anyOf' | 'oneOf' ): JsonSchema7 => {
	const branches = schema[ branchKey ];

	if ( ! Array.isArray( branches ) || branches.length !== 1 ) {
		return schema;
	}

	const [ singleBranch ] = branches;
	const { [ branchKey ]: _branchKey, description, allowBind, ...rest } = schema;

	return {
		...singleBranch,
		...rest,
		...( mergeDescriptions( description, singleBranch.description )
			? { description: mergeDescriptions( description, singleBranch.description ) }
			: {} ),
		allowBind: allowBind ?? singleBranch.allowBind,
	};
};

export const cleanupLlmJsonSchema = ( schema: JsonSchema7 ): JsonSchema7 => {
	let cleaned = unwrapSingleBranch( schema, 'anyOf' );
	cleaned = unwrapSingleBranch( cleaned, 'oneOf' );
	return cleaned;
};
