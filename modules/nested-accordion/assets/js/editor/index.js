elementorCommon.elements.$window.on( 'elementor/nested-element-type-loaded', async () => {
	new ( await import( '../editor/module' ) ).default();
} );
