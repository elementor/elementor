var BaseRegion = require( 'elementor-regions/base' );

module.exports = BaseRegion.extend( {
	el: '#elementor-sidebar',

	getStorageKey() {
		return 'sidebar';
	},

	getDefaultStorage() {
		return {
			size: {
				width: '',
			},
		};
	},

	constructor() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var SidebarLayoutView = require( 'elementor-regions/sidebar/layout' );

		this.show( new SidebarLayoutView() );
	},
} );
