import isValidRedirectUrl from './is-valid-redirect-url';

export default function safeRedirect( url ) {
	try {
		if ( url.startsWith( '/' ) ) {
			url = window.location.origin + url;
		}

		const decodedUrl = decodeURIComponent( url );
		if ( isValidRedirectUrl( decodedUrl ) ) {
			window.location.href = decodedUrl;
			return true;
		}
	} catch ( e ) {
		return false;
	}
}
