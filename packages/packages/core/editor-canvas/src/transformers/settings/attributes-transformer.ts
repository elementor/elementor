import { createTransformer } from '../create-transformer';

export const attributesTransformer = createTransformer( ( values: { key: string; value: string }[] ) => {
	return values
		.map( ( value ) => {
			if ( ! value.key || ! value.value ) {
				return '';
			}

			return `${ value.key }="${ value.value }"`;
		} )
		.join( ' ' );
} );
