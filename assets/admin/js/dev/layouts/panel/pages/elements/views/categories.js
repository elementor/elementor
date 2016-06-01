var PanelElementsCategoryView = require( './category' ),
	PanelElementsCategoriesView;

PanelElementsCategoriesView = Marionette.CollectionView.extend( {
	childView: PanelElementsCategoryView,

	id: 'elementor-panel-elements-categories'
} );

module.exports = PanelElementsCategoriesView;
