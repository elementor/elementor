elementorCommon.elements.$window.on( 'elementor:init-components', async () => {
	// The module should be loaded only when `nestedElements` is available.
	await elementor.modules.nestedElements;

	new ( await import( '../editor/module' ) ).default();
} );
