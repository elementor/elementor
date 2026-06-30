export default function isValidRedirectUrl( url ) {
	try {
		const parsedUrl = new URL( url );
		return parsedUrl.hostname === window.location.hostname &&
			( 'http:' === parsedUrl.protocol || 'https:' === parsedUrl.protocol );
	} catch ( e ) {
		return false;
	}
}

