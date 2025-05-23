export default function useAddKitPromotionUTM( promotionUrl, kitId, kitTitle ) {
	if ( ! promotionUrl ) {
		return '';
	}

	let url;

	try {
		url = new URL( promotionUrl );
	} catch ( e ) {
		return '';
	}

	if ( kitTitle && 'string' === typeof kitTitle ) {
		const cleanTitle = kitTitle.trim().replace( /\s+/g, '-' ).replace( /[^\w-]/g, '' ).toLowerCase();
		url.searchParams.set( 'utm_term', cleanTitle );
	}
	if ( kitId && 'string' === typeof kitId ) {
		url.searchParams.set( 'utm_content', kitId );
	}
	return url.toString();
}
