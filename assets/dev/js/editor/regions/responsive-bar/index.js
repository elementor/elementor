import ResponsiveBar from 'elementor-regions/responsive-bar/responsive-bar';

elementor.on( 'preview:loaded', ( isFirstLoad ) => {
	if ( ! isFirstLoad ) {
		return;
	}

	elementor.addRegions( {
		responsiveBar: {
			el: '#elementor-responsive-bar',
			regionClass: ResponsiveBar,
		},
	} );

	elementor.trigger( 'responsiveBar:init' );
} );
