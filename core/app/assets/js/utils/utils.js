export const pxToRem = ( pixels ) => {
	if ( ! pixels ) {
		return;
	} else if ( 'string' !== typeof pixels ) {
		pixels = pixels.toString();
	}

	return pixels
		.split( ' ' )
		.map( ( value ) => `${ value * 0.0625 }rem` )
		.join( ' ' );
};

export const arrayToClassName = ( array, action ) => {
	return array
		.filter( ( item ) => 'object' === typeof ( item ) ? Object.entries( item )[ 0 ][ 1 ] : item )
		.map( ( item ) => {
			const value = 'object' === typeof ( item ) ? Object.entries( item )[ 0 ][ 0 ] : item;

			return action ? action( value ) : value;
		} )
		.join( ' ' );
};

export const isOneOf = ( filetype, filetypeOptions ) => {
	return filetypeOptions.some( ( type ) => filetype.includes( type ) );
};
