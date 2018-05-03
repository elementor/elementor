var Module = require( 'elementor-utils/module' ),
	GetStartedLayout = require( 'elementor-admin/get-started/layout' );

var GetStartedModule = Module.extend( {

	onInit: function() {
		this.layout = new GetStartedLayout();

		this.layout.showModal();
	}
} );

jQuery( function() {
	new GetStartedModule();
} );
