var PanelElementsCategoryView = require( './category' ),
	PanelElementsCategoriesView;

PanelElementsCategoriesView = Marionette.CollectionView.extend( {
	childView: PanelElementsCategoryView,

	id: 'elementor-panel-elements-categories',

	initialize: function() {
		this.listenTo( elementor.channels.panelElements, 'filter:change', this.onPanelElementsFilterChange );
	},

	onPanelElementsFilterChange: function() {
		elementor.getPanelView().getCurrentPageView().showView( 'elements' );
	}
} );

module.exports = PanelElementsCategoriesView;
