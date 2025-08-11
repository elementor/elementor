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
