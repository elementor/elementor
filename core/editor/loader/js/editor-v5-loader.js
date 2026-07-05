if ( ! window.elementorV2?.editorV5?.start ) {
	throw new Error( 'The "@elementor/editor-v5" package was not loaded.' );
}

window.elementorV5 = window.elementorV5 || {};
window.elementorV5.editor = window.elementorV2.editorV5;

window.elementorV2.editorV5.start(
	document.getElementById( 'elementor-editor-wrapper-v5' ) || document.getElementById( 'elementor-editor-wrapper-v2' )
);
