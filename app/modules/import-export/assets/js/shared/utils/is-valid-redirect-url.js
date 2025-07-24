export default function isValidRedirectUrl( url ) {
        try {
                const parsedUrl = new URL( url );
                return parsedUrl.hostname === window.location.hostname && 
                        ( parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' );
        } catch ( e ) {
                return false;
        }
}
