import Events from 'elementor-utils/events';

elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	// Put promise of loading so other modules can use/await it.
	elementor.modules.nestedElements = import( '../editor/module' );

	elementor.modules.nestedElements.then( ( module ) => {
		elementor.modules.nestedElements = new module.default;
		elementor.modules.elements.types.NestedElementBase = import( './nested-element-types-base' );

		elementor.modules.elements.types.NestedElementBase.then( ( nestedElementBaseModule ) => {
			elementor.modules.elements.types.NestedElementBase = nestedElementBaseModule.default;
			events.dispatch( elementorCommon.elements.$window, 'elementor/nested-element-type-loaded' );
		} );
	} );
} );
