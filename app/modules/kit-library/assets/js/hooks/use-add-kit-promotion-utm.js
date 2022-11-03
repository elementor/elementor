export default function useAddKitPromotionUTM( promotionUrl, kitId, kitTitle ) {
	// If the kit is a free kit the promotionUrl doesn't exist and therefore we do not need to create a promotional URL.
	if ( ! promotionUrl ) {
		return;
	}

	const url = new URL( promotionUrl );
	const params = new URLSearchParams( url.search );

	if ( kitTitle ) {
		const cleanTitle = kitTitle.replace( /\s/g, '-' ).replace( /[^\w-]/g, '' ).toLowerCase();
		params.set( 'utm_term', cleanTitle );
	}

	if ( kitId ) {
		params.set( 'utm_content', kitId );
	}

	return `${ url.protocol }//${ url.host }${ url.pathname }?${ params.toString() }`;
}
