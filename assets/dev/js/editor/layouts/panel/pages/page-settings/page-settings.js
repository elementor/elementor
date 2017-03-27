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
		elementor.pageSettings.save();
	},

	onDestroy: function() {
		elementor.pageSettings.save();
	}
} );
