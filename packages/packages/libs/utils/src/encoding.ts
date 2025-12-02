export const encodeString = ( value: string ): string => {
	const utf8Bytes = encodeURIComponent( value ).replace( /%([0-9A-F]{2})/g, ( _, hex ) =>
		String.fromCharCode( parseInt( hex, 16 ) )
	);
	return btoa( utf8Bytes );
};

export const decodeString = < T = string >( value: string, fallback?: T ): string | T => {
	try {
		const utf8Bytes = atob( value );
		const percentEncoded = Array.from( utf8Bytes )
			.map( ( char ) => '%' + ( '00' + char.charCodeAt( 0 ).toString( 16 ) ).slice( -2 ) )
			.join( '' );
		return decodeURIComponent( percentEncoded );
	} catch {
		return fallback ?? '';
	}
};
