( function() {
	window.elementor.start();

	const { init } = window.__UNSTABLE__elementorPackages.editor;

	init( document.getElementById( 'elementor-editor-wrapper-v2' ) );
} )();
