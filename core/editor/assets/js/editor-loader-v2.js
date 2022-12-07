( function() {
	// Here should be all the loading logic for the editor v2.
	console.log( 'loaded: editor-loader-v2' );

	window.elementor.start();

	// TODO: Move to externals and use import.
	const { boot } = window.elementorEditorPackages.editorShell;

	boot( document.getElementById( 'elementor-editor-wrapper-v2' ) );
} )();
