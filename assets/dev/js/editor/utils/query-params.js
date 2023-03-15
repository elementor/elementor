export function getQueryParam( name ) {
	const queryParams = new URLSearchParams( window.location.search );

	return queryParams.get( name );
}

export function setQueryParam( name, value ) {
	const url = new URL( window.location.href );

	if ( null === value ) {
		url.searchParams.delete( name );
	} else {
		url.searchParams.set( name, value );
	}

	history.replaceState( {}, '', url );
}

export function removeQueryParam( name ) {
	setQueryParam( name, null );
}
