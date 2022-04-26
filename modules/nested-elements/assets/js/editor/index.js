elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	// Put promise of loading so other modules can use/await it.
	elementor.modules.nestedElements = import( '../editor/module' );

	elementor.modules.nestedElements.then( ( module ) => {
		elementor.modules.nestedElements = new module.default;
	} );
} );
