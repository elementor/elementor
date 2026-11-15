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

	if ( SUPPORTED_PROTOCOLS.indexOf( url.protocol ) < 0 ) {
		return null;
	}

	return {
		host: url.host.toLowerCase().replace( /^www\./, '' ),
		path: url.pathname.replace( /^\/+|\/+$/g, '' ),
		query: url.search.replace( /^\?/, '' ),
		hash: decodeHash( url.hash ),
	};
}

function isSamePage( link, page ) {
	if ( link.host !== page.host || link.path !== page.path ) {
		return false;
	}

	return link.query === page.query;
}

export function isCurrentPageLink( href, pageUrl = window.location.href ) {
	if ( 'string' === typeof href ) {
		if ( 0 === href.trim().indexOf( '#' ) ) {
			return false;
		}
	}

	const link = parseUrl( href, pageUrl );
	const page = parseUrl( pageUrl, pageUrl );

	if ( ! link || ! page || '' !== link.hash ) {
		return false;
	}

	return isSamePage( link, page );
}

export function getAnchorId( href, pageUrl = window.location.href ) {
	const link = parseUrl( href, pageUrl );
	const page = parseUrl( pageUrl, pageUrl );

	if ( ! link || ! page || '' === link.hash || ! isSamePage( link, page ) ) {
		return null;
	}

	return link.hash;
}
