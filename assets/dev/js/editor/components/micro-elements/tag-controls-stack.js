var ControlsStack = require( 'elementor-views/controls-stack' ),
	SettingsModel = require( 'elementor-elements/settings/base' );

module.exports = ControlsStack.extend( {
	activeTab: 'content',

	activeSection: 'settings',

	template: _.noop,

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	initModel: function() {
		this.collection = new Backbone.Collection( _.values( this.model.controls ) );
	},

	initialize: function() {
		this.initModel();
	},

	onRenderTemplate: _.noop
} );
