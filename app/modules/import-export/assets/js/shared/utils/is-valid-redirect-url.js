export default function isValidRedirectUrl( url ) {
	try {
		const parsedUrl = new URL( url );
		return parsedUrl.hostname === window.location.hostname;
	} catch ( e ) {
		return false;
	}
}
