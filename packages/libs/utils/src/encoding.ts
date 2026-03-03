export const encodeString = ( value: string ): string => {
	const binary = Array.from( new TextEncoder().encode( value ), ( b ) => String.fromCharCode( b ) ).join( '' );
	return btoa( binary );
};

export const decodeString = < T = string >( value: string, fallback?: T ): string | T => {
	try {
		const binary = atob( value );
		const bytes = new Uint8Array( Array.from( binary, ( char ) => char.charCodeAt( 0 ) ) );
		return new TextDecoder().decode( bytes );
	} catch {
		return fallback !== undefined ? fallback : '';
	}
};
