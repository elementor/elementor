export const toMCPTitle = ( namespace: string ): string => {
	const label = namespace
		.split( '_' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );

	return `Editor ${ label }`;
};
