elementorCommon.elements.$window.on( 'elementor:pre-start', () => {
	// Inject promise of module loading.
	// Give the opportunity tell `elementor` to wait for the module(s) to be loaded, and then continue to original load.
	elementor.modules.nestedElements = import( 'elementor/modules/nested-elements/assets/js/editor/module' );
} );
