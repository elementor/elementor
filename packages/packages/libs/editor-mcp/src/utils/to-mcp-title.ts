export const toMCPTitle = ( namespace: string ): string => {
	const capitalized = namespace.charAt( 0 ).toUpperCase() + namespace.slice( 1 );
	return `Editor ${ capitalized }`;
};
