export const ANALYTICS_TRANSFORM_RULES = {
	STRING: ( value ) => value,
	BOOLEAN: ( value ) => value,
	EMPTY_ARRAY: () => 'None',
	FULL_ARRAY: () => 'All',
	PARTIAL_ARRAY: () => 'Partial',
};

export const getTotalAvailableCount = ( key, optionsArray ) => {
	const optionsMap = optionsArray.reduce( ( map, { key: optionKey, options } ) => {
		map[ optionKey ] = options.length;
		return map;
	}, {} );

	return optionsMap[ key ] || 0;
};

export const transformValueForAnalytics = ( key, value, optionsArray ) => {
	if ( 'string' === typeof value || 'boolean' === typeof value ) {
		return ANALYTICS_TRANSFORM_RULES[ ( typeof value ).toUpperCase() ]( value );
	}

	if ( 'object' === typeof value && value !== null && ! Array.isArray( value ) && 'enabled' in value ) {
		return value.enabled;
	}

	if ( Array.isArray( value ) ) {
		if ( 0 === value.length ) {
			return ANALYTICS_TRANSFORM_RULES.EMPTY_ARRAY();
		}

		const totalAvailable = getTotalAvailableCount( key, optionsArray );
		const isFullSelection = value.length === totalAvailable;

		return isFullSelection
			? ANALYTICS_TRANSFORM_RULES.FULL_ARRAY()
			: ANALYTICS_TRANSFORM_RULES.PARTIAL_ARRAY();
	}

	return value;
};
