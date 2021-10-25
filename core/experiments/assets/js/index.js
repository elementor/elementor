elementorCommon.elements.$window.on( 'elementor:init', () => {
	if ( elementorCommon.config.experimentalFeatures[ 'nested-elements' ] ) {
		/* webpackChunkName: "modules/nested-elements" */
		import( '../../../../modules/nested-elements/assets/js/editor/module' );
	}
} );
