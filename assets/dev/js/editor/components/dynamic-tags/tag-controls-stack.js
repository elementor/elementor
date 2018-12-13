var EmptyView = require( 'elementor-dynamic-tags/tag-controls-stack-empty' );

module.exports = elementorModules.editor.views.ControlsStack.extend( {
	activeTab: 'content',

	template: _.noop,

	emptyView: EmptyView,

	isEmpty: function() {
		// Ignore the section control
		return this.collection.length < 2;
	},

	onRenderTemplate: function() {
		this.activateFirstSection();
	},
} );
