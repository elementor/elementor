module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-global',

	initialize: function() {
		elementor.getPanelView().content.currentView.search.reset();
	},

	onDestroy: function() {
		elementor.getPanelView().content.currentView.showSearchView();
	}
} );
