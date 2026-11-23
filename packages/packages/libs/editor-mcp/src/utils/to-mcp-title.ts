export const toMCPTitle = ( namespace: string ): string => {
	const label = namespace
		.split( '_' )
		.filter( Boolean )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );

	return `Editor ${ label }`;
};
