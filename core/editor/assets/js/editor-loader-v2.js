window.__elementorEditorV1Loaded = new Promise( ( resolve, reject ) => {
	window.addEventListener( 'elementor/init', () => {
		resolve();
	} );
} );

window.elementor.start();

const { init } = window.__UNSTABLE__elementorPackages.editor;

init( document.getElementById( 'elementor-editor-wrapper-v2' ) );
