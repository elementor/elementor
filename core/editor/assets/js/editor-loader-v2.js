window.__elementorEditorV1LoadingPromise = new Promise( ( resolve ) => {
	window.addEventListener( 'elementor/init', () => {
		resolve();
	}, { once: true } );
} );

window.elementor.start();

if ( ! window.__UNSTABLE__elementorPackages?.editor ) {
    throw new Error( 'The "@elementor/editor" package was not loaded.' );
}

window.__UNSTABLE__elementorPackages
	.editor
	.init(
		document.getElementById( 'elementor-editor-wrapper-v2' ),
		window.elementorEditorV2Settings,
	);
