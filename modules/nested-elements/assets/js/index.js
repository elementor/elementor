elementorCommon.elements.$window.on( 'elementor:init-components', async () => {
	elementor.modules.nestedElements = new ( await import( 'elementor/modules/nested-elements/assets/js/editor/module' ) ).default();
} );
