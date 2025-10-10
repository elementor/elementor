export const generateScreenshot = () => {
	return new Promise( ( resolve ) => {
		const iframe = document.createElement( 'iframe' );
		iframe.style = 'visibility: hidden;';
		iframe.width = '1200';
		iframe.height = '1000';

		const messageHandler = ( event ) => {
			if ( 'kit-screenshot-done' === event.data.name ) {
				window.removeEventListener( 'message', messageHandler );
				document.body.removeChild( iframe );
				resolve( event.data.imageUrl || null );
			}
		};

		window.addEventListener( 'message', messageHandler );

		const previewUrl = new URL( window.location.origin );
		previewUrl.searchParams.set( 'kit_thumbnail', '1' );
		previewUrl.searchParams.set( 'nonce', elementorAppConfig[ 'import-export-customization' ].kitPreviewNonce );

		document.body.appendChild( iframe );
		iframe.src = previewUrl.toString();
	} );
};
