elementorCommon.elements.$window.on( 'elementor:init-components', async () => {
	await elementor.modules.nestedElements;
	elementor.modules.nestedTabs = new ( await import( './editor/module' ) ).default();
} );
