/* eslint-disable no-bitwise */
type UnknownObject = Record< string, unknown >;

// Inspired by:
// https://github.com/TanStack/query/blob/66ea5f2fc/packages/query-core/src/utils.ts#L212
export function hash( obj: UnknownObject ): string {
	return JSON.stringify( obj, ( _, value ) =>
		isPlainObject( value )
			? Object.keys( value )
					.sort()
					.reduce< UnknownObject >( ( result, key ) => {
						result[ key ] = value[ key ];

						return result;
					}, {} )
			: value
	);
}

function isPlainObject( value: unknown ): value is UnknownObject {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

// Inspired by:
// https://github.com/darkskyapp/string-hash/blob/master/index.js
export function hashString( str: string, maxLength?: number ): string {
	let hashBasis = 5381;

	let i = str.length;
	while ( i ) {
		hashBasis = ( hashBasis * 33 ) ^ str.charCodeAt( --i );
	}

	/* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
	 * integers. Since we want the results to be always positive, convert the
	 * signed int to an unsigned by doing an unsigned bitshift. */
	const result = ( hashBasis >>> 0 ).toString( 36 );

	if ( maxLength === undefined ) {
		return result;
	}
	return result.slice( -maxLength );
}
