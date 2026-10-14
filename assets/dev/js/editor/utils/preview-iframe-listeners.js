export function bindPreviewIframeEvents( callback ) {
	const iframeDocument = elementor?.$preview?.[ 0 ]?.contentDocument;

	if ( ! iframeDocument ) {
		return () => {};
	}

	const handleEvent = () => callback();

	iframeDocument.addEventListener( 'click', handleEvent );
	iframeDocument.addEventListener( 'keydown', handleEvent );

	return () => {
		iframeDocument.removeEventListener( 'click', handleEvent );
		iframeDocument.removeEventListener( 'keydown', handleEvent );
	};
}
