var ControlsStack = require( 'elementor-views/controls-stack' ),
	EmptyView = require( 'elementor-dynamic-tags/tag-controls-stack-empty' );

module.exports = ControlsStack.extend( {
	activeTab: 'content',

	template: _.noop,

	emptyView: EmptyView,

	isEmpty: function() {
		// Ignore the section control
		return this.collection.length < 2;
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	onRenderTemplate: function() {
		this.activateFirstSection();
	}
} );
