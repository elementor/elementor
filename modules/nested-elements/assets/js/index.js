elementorCommon.elements.$window.on( 'elementor:init-components', async () => {
	elementor.modules.nestedElements = new ( await import( './editor/module' ) ).default();
} );
