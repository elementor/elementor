export const encodeString = ( value: string ): string => {
	return btoa( value );
};

export const decodeString = < T = string >( value: string, fallback?: T ): T | string => {
	try {
		return atob( value );
	} catch {
		return fallback || '';
	}
};
