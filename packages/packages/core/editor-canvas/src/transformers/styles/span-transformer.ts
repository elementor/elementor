import { createTransformer } from '../create-transformer';

export const spanTransformer = createTransformer( ( value: string | null ) => {
	return value?.trim() || null;
} );
