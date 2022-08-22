import CategoryEmptyView from '../views/category-empty-view';

export default class PanelCategoryBehavior extends Marionette.Behavior {
	initialize() {
		if ( this.isFavoritesCategory() ) {
			this.view.emptyView = CategoryEmptyView;
		}
	}

	onRender() {
		if ( this.isFavoritesCategory() ) {
			this.view.toggle( ! this.view.isEmpty(), false );
		}
	}

	isFavoritesCategory() {
		return 'favorites' === this.view.options.model.get( 'name' );
	}
}
