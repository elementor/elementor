import CategoryEmptyView from '../views/category-empty-view';

export default class PanelCategoryBehavior extends Marionette.Behavior {
	initialize() {
		if ( this.isFavoritesCategory() ) {
			this.view.emptyView = CategoryEmptyView;
		}
	}

	isFavoritesCategory() {
		return 'favorites' === this.view.options.model.get( 'name' );
	}
}
