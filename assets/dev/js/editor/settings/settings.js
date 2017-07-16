var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
	modules: {
		base: require( 'elementor-editor/settings/base/manager' ),
		general: require( 'elementor-editor/settings/general/manager' ),
		page: require( 'elementor-editor/settings/page/manager' )
	},

	panelPages: {
		base: require( 'elementor-editor/settings/base/panel' )
	},

	onInit: function() {
		this.initSettings();
	},

	initSettings: function() {
		var self = this;

		_.each( elementor.config.settings, function( config, name ) {
			var Manager = self.modules[ name ] || self.modules.base;

			self[ name ] = new Manager( config );
		} );
	}
} );
