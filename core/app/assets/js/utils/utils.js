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

/**
 * Return the first element of an iterable (object/array) if it has only one value.
 *
 * @param iterable The values iterable (the first value is retrieved from it)
 * @param context The iterable that its length is being checked (defaults to the `iterable` argument)
 * @param fallback The value that will be returned if the context is empty
 * @returns {{}|[]|*}
 */
export const firstIfSingle = ( iterable, { context = iterable, fallback } ) => {
	iterable = 'object' === typeof iterable ?
		Object.values( iterable ) :
		iterable;

	context = 'object' === typeof context ?
		Object.values( context ) :
		context;

	if ( ! context.length && undefined !== fallback ) {
		return fallback;
	} else if ( 1 === context.length ) {
		return iterable[ 0 ];
	}

	return iterable;
};

export const stringToRemValues = ( string ) => {
	return string
		.split( ' ' )
		.map( ( value ) => pxToRem( value ) )
		.join( ' ' );
};

export const rgbToHex = ( r, g, b ) => '#' + [ r, g, b ].map( ( x ) => {
	const hex = x.toString( 16 );
	return 1 === hex.length ? '0' + hex : hex;
} ).join( '' );

export const isOneOf = ( filetype, filetypeOptions ) => {
	return filetypeOptions.some( ( type ) => filetype.includes( type ) );
};
