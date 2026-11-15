const SUPPORTED_PROTOCOLS = [ 'http:', 'https:' ];

function decodeHash( hash ) {
	const raw = hash.replace( /^#/, '' );

	try {
		return decodeURIComponent( raw );
	} catch {
		return raw;
	}
}

function parseUrl( href, base ) {
	if ( ! href || 'string' !== typeof href ) {
		return null;
	}

	let url;

	try {
		url = new URL( href, base );
	} catch {
		return null;
	}

	if ( ! SUPPORTED_PROTOCOLS.includes( url.protocol ) ) {
		return null;
	}

	return {
		host: url.host.toLowerCase().replace( /^www\./, '' ),
		path: url.pathname.replace( /^\/+|\/+$/g, '' ),
		params: url.searchParams,
		hash: decodeHash( url.hash ),
	};
}

function hasLinkParams( linkParams, pageParams ) {
	for ( const key of new Set( linkParams.keys() ) ) {
		const wanted = linkParams.getAll( key );
		const actual = pageParams.getAll( key );

		if ( wanted.length !== actual.length || wanted.some( ( value, index ) => value !== actual[ index ] ) ) {
			return false;
		}
	}

	return true;
}

function isSamePage( link, page ) {
	return link.host === page.host && link.path === page.path && hasLinkParams( link.params, page.params );
}

export function isCurrentPageLink( href, pageUrl = window.location.href ) {
	if ( String( href ).trim().startsWith( '#' ) ) {
		return false;
	}

	const link = parseUrl( href, pageUrl );
	const page = parseUrl( pageUrl, pageUrl );

	return !! link && !! page && '' === link.hash && isSamePage( link, page );
}

export function getAnchorId( href, pageUrl = window.location.href ) {
	const link = parseUrl( href, pageUrl );
	const page = parseUrl( pageUrl, pageUrl );

	if ( ! link || ! page || '' === link.hash || ! isSamePage( link, page ) ) {
		return null;
	}

	return link.hash;
}
