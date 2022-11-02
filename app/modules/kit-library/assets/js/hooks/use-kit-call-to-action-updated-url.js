export default function useKitCallToActionUpdatedUrl( url, kitId, kitTitle ) {
	if ( kitTitle ) {
		const cleanTitle = kitTitle.replace( /\s/g, '-' ).replace( /[^\w-]/g, '' ).toLowerCase();
		url += `&utm_term=${ cleanTitle }`;
	}

	if ( kitId ) {
		url += `&utm_content=${ kitId }`;
	}

	return url;
}
