import { createTransformer } from '../create-transformer';

export const dateTimeTransformer = createTransformer( ( values: { date?: string; time?: string }[] ) => {
	return values
		.map( ( value ) => {
			const date = ( value.date || '' ).trim();
			const time = ( value.time || '' ).trim();
			if ( ! date && ! time ) {
				return '';
			}
			return ( `${ date } ${ time }` ).trim();
		} )
		.join( ' ' );
} );
