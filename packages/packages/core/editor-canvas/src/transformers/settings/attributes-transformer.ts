import { createTransformer } from '../create-transformer';
import { shouldRenderAttributes } from '../../render-gates';

export const attributesTransformer = createTransformer( ( values: { key: string; value: string }[] ) => {
	if ( ! shouldRenderAttributes() ) {
		return '';
	}
	return values
		.map( ( value ) => {
			if ( ! value.key || ! value.value ) {
				return '';
			}

			return `${ value.key }="${ value.value }"`;
		} )
		.join( ' ' );
} );
