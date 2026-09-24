const INSTALLED_FLAG = '__elementorEventsProxyFetchInstalled';

function buildMixpanelAuthorization( token ) {
	return `Basic ${ btoa( `${ token }:` ) }`;
}

function isProxyRequestUrl( url, proxyPrefixes ) {
	return proxyPrefixes.some( ( prefix ) => url.startsWith( prefix ) );
}

function stripMixpanelAuthorization( init, token ) {
	if ( ! init?.headers || ! token ) {
		return init;
	}

	const mixpanelAuthorization = buildMixpanelAuthorization( token );
	const headers = new Headers( init.headers );
	const authorization = headers.get( 'Authorization' );

	if ( authorization !== mixpanelAuthorization ) {
		return init;
	}

	headers.delete( 'Authorization' );

	return {
		...init,
		credentials: init.credentials ?? 'include',
		headers,
	};
}

export function installEventsProxyFetch( proxyApiHost, proxyLibBasePath, token ) {
	if ( ! proxyApiHost || ! token || window[ INSTALLED_FLAG ] || 'function' !== typeof window.fetch ) {
		return;
	}

	const proxyPrefixes = [ proxyApiHost, proxyLibBasePath ].filter( Boolean );
	const nativeFetch = window.fetch.bind( window );

	window.fetch = ( input, init = {} ) => {
		const url = 'string' === typeof input ? input : input?.url;

		if ( ! url || ! isProxyRequestUrl( url, proxyPrefixes ) ) {
			return nativeFetch( input, init );
		}

		const nextInit = stripMixpanelAuthorization( init, token );

		return nativeFetch( input, nextInit );
	};

	window[ INSTALLED_FLAG ] = true;
}
