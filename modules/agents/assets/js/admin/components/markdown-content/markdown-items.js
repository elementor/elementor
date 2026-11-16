export const getIncludedTypesKey = ( postTypes ) => postTypes
	.filter( ( postType ) => postType.included )
	.map( ( postType ) => postType.name )
	.join( ',' );

export const getMarkdownFileName = ( item ) => {
	const segment = item.path.replace( /\/$/, '' ).split( '/' ).pop();

	return segment ? `${ segment }.md` : 'index.md';
};
