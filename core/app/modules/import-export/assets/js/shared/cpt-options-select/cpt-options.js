export const getCustomPostTypes = ( customPostTypeFromServer, label ) => {
	const cptOptionsArray = [];
	// eslint-disable-next-line no-unused-expressions
	{ customPostTypeFromServer &&
		Object.keys( customPostTypeFromServer ).forEach( ( key ) => cptOptionsArray.push( {
			label: customPostTypeFromServer[ key ][ label ],
			value: key,
		} ) );
	}
	return cptOptionsArray;
};
