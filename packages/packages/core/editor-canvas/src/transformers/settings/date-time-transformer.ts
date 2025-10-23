import { createTransformer } from '../create-transformer';

export const dateTimeTransformer = createTransformer( ( values: { date: string; time: string }[] ) => {
	return values
		.map( ( value ) => {
			if ( ! value.date || ! value.time ) {
				return '';
			}

			return `${ value.date }${ value.time }`;
		} )
		.join( ' ' );
} );
