import { createTransformer } from '../create-transformer';

export const spanTransformer = createTransformer( ( value: number ) => {
	return value || 0 === value ? 'span ' + value : null;
} );
