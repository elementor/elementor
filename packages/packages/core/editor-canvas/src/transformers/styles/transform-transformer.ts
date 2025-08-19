import { createTransformer } from '../create-transformer';

export const transformTransformer = createTransformer( ( values: string[] ) => {
	if ( values?.length < 1 ) {
		return null;
	}

	return values.join( ' ' );
} );
