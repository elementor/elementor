elementorCommon.elements.$window.on( 'elementor/nested-element-type-loaded', async () => {
	// The module should be loaded only when `nestedElements` is available.

	new ( await import( '../editor/module' ) ).default();
} );
