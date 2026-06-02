import { createTransformer } from '../create-transformer';

export const fontFamilyTransformer = createTransformer( ( value: string | null ) => {
	return typeof value === 'string' ? `"${ value }"` : null;
} );
