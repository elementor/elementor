import EditorPreferences from './editor-preferences/manager';

module.exports = elementorModules.Module.extend( {
	modules: {
		base: require( 'elementor-editor/components/settings/base/manager' ),
		page: require( 'elementor-editor/components/settings/page/manager' ),
		editorPreferences: EditorPreferences,
	},

	panelPages: {
		base: require( 'elementor-editor/components/settings/base/panel' ),
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
	},
} );
