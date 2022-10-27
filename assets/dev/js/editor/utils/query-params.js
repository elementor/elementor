export function getQueryParam( name ) {
	const queryParams = new URLSearchParams( window.location.search );

	return queryParams.get( name );
}

export function setQueryParam( name, value ) {
	const url = new URL( window.location.href );

	if ( value ) {
		url.searchParams.set( name, value );
	} else {
		url.searchParams.delete( name );
	}

	history.replaceState( {}, '', url );
}

export function removeQueryParam( name ) {
	setQueryParam( name, null );
}
