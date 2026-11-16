const SUPPORTED_PROTOCOLS = [ 'http:', 'https:' ];
const IGNORED_PARAM_PREFIX = 'utm_';
const IGNORED_PARAMS = [ 'fbclid', 'gclid', 'elementor-preview', 'ver', 'preview', 'preview_id', 'preview_nonce' ];

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

function isIgnoredParam( key ) {
	return IGNORED_PARAMS.includes( key ) || key.startsWith( IGNORED_PARAM_PREFIX );
}

function toComparableParams( params ) {
	return [ ...params.entries() ]
		.filter( ( [ key ] ) => ! isIgnoredParam( key ) )
		.map( ( [ key, value ] ) => `${ key }=${ value }` )
		.sort()
		.join( '&' );
}

function isSamePage( link, page ) {
	return link.host === page.host && link.path === page.path && toComparableParams( link.params ) === toComparableParams( page.params );
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
