module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-global',

	id: 'elementor-panel-global',

	initialize() {
		elementor.getPanelView().getCurrentPageView().search.reset();
	},
} );
