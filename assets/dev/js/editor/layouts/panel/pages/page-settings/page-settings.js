var ControlsStack = require( 'elementor-views/controls-stack' );

module.exports = ControlsStack.extend( {
	id: 'elementor-panel-page-settings',

	template: '#tmpl-elementor-panel-page-settings',

	childViewContainer: '#elementor-panel-page-settings-controls',

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	initialize: function() {
		this.model = elementor.pageSettings.model;

		this.collection = new Backbone.Collection( _.values( this.model.controls ) );
	},

	onChildviewSettingsChange: function() {
		this.ui.reloadButton.prop( 'disabled', false );
	},

	onReloadButtonClick: function() {
		var self = this,
			settings = self.model.toJSON();

		settings.id = elementor.config.post_id;

		NProgress.start();

		elementor.ajax.send( 'save_page_settings', {
			data: settings,
			success: function() {
				elementor.pageSettings.setSettings( 'savedSettings', settings );

				elementor.reloadPreview();

				elementor.once( 'preview:loaded', function() {
					NProgress.done();

					elementor.getPanelView().setPage( 'settingsPage' );
				} );
			},
			error: function() {
				alert( 'An error occurred' );
			}
		} );
	},

	onDestroy: function() {
		elementor.pageSettings.resetModel();
	}
} );
