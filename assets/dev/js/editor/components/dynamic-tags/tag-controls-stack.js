var EmptyView = require( 'elementor-dynamic-tags/tag-controls-stack-empty' );

module.exports = elementorModules.editor.views.ControlsStack.extend( {
	activeTab: 'content',

	template: _.noop,

	emptyView: EmptyView,

	isEmpty: function() {
		// Ignore the section control
		return this.collection.length < 2;
	},

	getNamespaceArray: function() {
		var currentPageView = elementor.getPanelView().getCurrentPageView(),
			eventNamespace = currentPageView.getNamespaceArray();

		eventNamespace.push( currentPageView.activeSection );

		eventNamespace.push( this.getOption( 'parentName' ) );

		eventNamespace.push( this.getOption( 'name' ) );

		return eventNamespace;
	},

	onRenderTemplate: function() {
		this.activateFirstSection();
	},
} );
