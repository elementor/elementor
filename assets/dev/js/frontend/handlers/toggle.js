var TabsModule = require( 'elementor-frontend/handlers/base-tabs' );

module.exports = function( $scope ) {
	new TabsModule( {
		$element: $scope,
		showTabFn: 'slideDown',
		hideTabFn: 'slideUp',
		hidePrevious: false,
		autoExpand: 'editor'
	} );
};
