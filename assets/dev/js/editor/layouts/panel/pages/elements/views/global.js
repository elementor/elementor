module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-global',

	id: 'elementor-panel-global',

	initialize: function() {
		elementor.getPanelView().getCurrentPageView().search.reset();
	},

	onDestroy: function() {
		var panel = elementor.getPanelView();

		if ( 'elements' === panel.getCurrentPageName() ) {
			panel.getCurrentPageView().showView( 'search' );
		}
	}
} );
