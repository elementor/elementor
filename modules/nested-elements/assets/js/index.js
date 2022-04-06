elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	elementor.modules.nestedElements = import( './editor/module' ).then( ( module ) => {
		elementor.modules.nestedElements = new module.default;
	} );
} );
