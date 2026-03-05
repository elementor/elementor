export const compareVersions = ( a: string | number, b: string | number ): number => {
	const aParts = String( a || '0.0.0' )
		.split( '.' )
		.map( Number );
	const bParts = String( b || '0.0.0' )
		.split( '.' )
		.map( Number );

	for ( let i = 0; i < Math.max( aParts.length, bParts.length ); i++ ) {
		const aVal = aParts[ i ] || 0;
		const bVal = bParts[ i ] || 0;
		if ( aVal !== bVal ) {
			return aVal - bVal;
		}
	}
	return 0;
};

export const isVersionLessThan = ( a: string | number, b: string | number ): boolean => {
	return compareVersions( a, b ) < 0;
};

export const isVersionGreaterOrEqual = ( a: string | number, b: string | number ): boolean => {
	return compareVersions( a, b ) >= 0;
};
