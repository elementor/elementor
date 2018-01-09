var ControlsStack = require( 'elementor-views/controls-stack' ),
	EmptyView = require( 'elementor-micro-elements/tag-controls-stack-empty' );

module.exports = ControlsStack.extend( {
	activeTab: 'content',

	activeSection: 'settings',

	template: _.noop,

	emptyView: EmptyView,

	isEmpty: function() {
		return this.collection.length < 2;
	},

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
