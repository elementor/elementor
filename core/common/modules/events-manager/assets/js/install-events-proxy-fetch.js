const INSTALLED_FLAG = '__elementorEventsProxyFetchInstalled';

function buildMixpanelAuthorization( token ) {
	return `Basic ${ btoa( `${ token }:` ) }`;
}

function isProxyRequestUrl( url, proxyPrefixes ) {
	return proxyPrefixes.some( ( prefix ) => url.startsWith( prefix ) );
}

function isFetchRequest( input ) {
	return 'function' === typeof Request && input instanceof Request;
}

function mergeFetchHeaders( input, init ) {
	const headers = new Headers();

	if ( isFetchRequest( input ) ) {
		input.headers.forEach( ( value, key ) => {
			headers.set( key, value );
		} );
	}

	if ( init?.headers ) {
		new Headers( init.headers ).forEach( ( value, key ) => {
			headers.set( key, value );
		} );
	}

	return headers;
}

function stripMixpanelAuthorization( input, init, token ) {
	if ( ! token ) {
		return { input, init, stripped: false };
	}

	const headers = mergeFetchHeaders( input, init );
	const mixpanelAuthorization = buildMixpanelAuthorization( token );

	if ( headers.get( 'Authorization' ) !== mixpanelAuthorization ) {
		return { input, init, stripped: false };
	}

	headers.delete( 'Authorization' );

	const credentials = init.credentials ?? 'include';

	if ( isFetchRequest( input ) ) {
		return {
			input: new Request( input, { headers, credentials } ),
			init: undefined,
			stripped: true,
		};
	}

	return {
		input,
		init: {
			...init,
			credentials,
			headers,
		},
		stripped: true,
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

		const { input: nextInput, init: nextInit } = stripMixpanelAuthorization( input, init, token );

		if ( undefined === nextInit ) {
			return nativeFetch( nextInput );
		}

		return nativeFetch( nextInput, nextInit );
	};

	window[ INSTALLED_FLAG ] = true;
}
