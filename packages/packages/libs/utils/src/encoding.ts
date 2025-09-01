export const encodeString = ( value: string ): string => {
	return btoa( value );
};

export const decodeString = ( value: string, fallback: string = '' ): string => {
	try {
		return atob( value );
	} catch {
		return fallback;
	}
};
