export function formatToTitleCase( str ) {
	return str
		.replace( /([A-Z])/g, ' $1' )
		.replace( /^./, ( s ) => s.toUpperCase() )
		.trim();
}
