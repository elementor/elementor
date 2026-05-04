export const createSimpleResourceHandler = ( text: string ) => async ( uri: URL ) => ( {
	contents: [ { uri: uri.href, mimeType: 'text/plain', text } ],
} );
