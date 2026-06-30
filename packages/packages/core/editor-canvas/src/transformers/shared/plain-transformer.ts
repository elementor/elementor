import { createTransformer } from '../create-transformer';

export const plainTransformer = createTransformer( ( value: unknown ) => {
	return value;
} );
