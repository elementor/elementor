export function camelToDash( str ) {
	return str
		.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
		.toLowerCase();
}
