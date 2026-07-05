import { createTransformer } from '../create-transformer';

export const fontFamilyTransformer = createTransformer( ( value: string | null ) => {
	if ( typeof value !== 'string' || ! value.trim() ) {
		return null;
	}

	const trimmed = value.trim();

	if (
		( trimmed.startsWith( '"' ) && trimmed.endsWith( '"' ) ) ||
		( trimmed.startsWith( "'" ) && trimmed.endsWith( "'" ) )
	) {
		return trimmed;
	}

	return `"${ trimmed }"`;
} );
