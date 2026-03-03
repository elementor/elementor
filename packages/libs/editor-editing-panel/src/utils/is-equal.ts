export function isEqual( a: unknown, b: unknown ): boolean {
	if ( a === b ) {
		return true;
	}

	if ( a === null || b === null ) {
		return false;
	}

	if ( typeof a !== typeof b ) {
		return false;
	}

	if ( Array.isArray( a ) && Array.isArray( b ) ) {
		if ( a.length !== b.length ) {
			return false;
		}

		for ( let i = 0; i < a.length; i++ ) {
			if ( ! isEqual( a[ i ], b[ i ] ) ) {
				return false;
			}
		}

		return true;
	}

	if ( typeof a === 'object' && typeof b === 'object' ) {
		const objA = a as Record< string, unknown >;
		const objB = b as Record< string, unknown >;

		const keysA = Object.keys( objA );
		const keysB = Object.keys( objB );

		if ( keysA.length !== keysB.length ) {
			return false;
		}

		for ( const key of keysA ) {
			if ( ! ( key in objB ) ) {
				return false;
			}

			if ( ! isEqual( objA[ key ], objB[ key ] ) ) {
				return false;
			}
		}

		return true;
	}

	return false;
}
