var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
	modules: {
		base: require( 'elementor-editor/components/settings/base/manager' ),
		general: require( 'elementor-editor/components/settings/general/manager' ),
		document: require( 'elementor-editor/components/settings/document/manager' )
	},

	panelPages: {
		base: require( 'elementor-editor/components/settings/base/panel' )
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
