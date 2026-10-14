import isValidRedirectUrl from './is-valid-redirect-url';

export default function safeRedirect( url ) {
	try {
		let decodedUrl = decodeURIComponent( url );
		if ( decodedUrl.startsWith( '/' ) ) {
			decodedUrl = window.location.origin + decodedUrl;
		}

		if ( isValidRedirectUrl( decodedUrl ) ) {
			window.location.href = decodedUrl;
			return true;
		}
	} catch ( e ) {
		return false;
	}
}

