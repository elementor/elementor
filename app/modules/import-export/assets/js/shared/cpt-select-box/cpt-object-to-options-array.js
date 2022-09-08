export const cptObjectToOptionsArray = ( cptObject, label = 'label' ) => {
	const cptOptionsArray = [];
	// eslint-disable-next-line no-unused-expressions
	if ( cptObject && label ) {
		Object.keys( cptObject ).forEach( ( key ) => cptOptionsArray.push( {
			label: cptObject[ key ][ label ],
			value: key,
		} ) );
	}
	return cptOptionsArray;
};
