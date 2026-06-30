import { createTransformer } from '../create-transformer';

type Size = {
	size?: number;
	unit?: string;
};

export const sizeTransformer = createTransformer( ( value: Size ) => {
	if ( value.unit === 'auto' ) {
		return 'auto';
	}
	return value.unit === 'custom' ? value.size : `${ value.size }${ value.unit }`;
} );
