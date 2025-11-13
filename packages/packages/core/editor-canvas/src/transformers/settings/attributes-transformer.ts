import { createTransformer } from '../create-transformer';

export const attributesTransformer = createTransformer( ( values: { key: string; value: string }[] ) => {
	return '';
} );
