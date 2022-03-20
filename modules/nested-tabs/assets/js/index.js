elementorCommon.elements.$window.on( 'elementor:init-components', async () => {
	// The module should be loaded only when `nestedElements` is available.
	await elementor.modules.nestedElements;

	elementor.modules.nestedTabs = new ( await import( './editor/module' ) ).default();
} );
