import { createTransformer } from '../create-transformer';

type Size = {
	size?: number;
	unit?: string;
};

export const sizeTransformer = createTransformer( ( value: Size ) => {
	return value.unit === 'custom' ? value.size : `${ value.size }${ value.unit }`;
} );
