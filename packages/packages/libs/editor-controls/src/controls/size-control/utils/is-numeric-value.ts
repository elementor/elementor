export const isNumericValue = ( value: unknown ): boolean => {
	if ( typeof value === 'number' ) {
		return ! isNaN( value );
	}

	if ( typeof value === 'string' ) {
		return value.trim() !== '' && ! isNaN( Number( value ) );
	}

	return false;
};
