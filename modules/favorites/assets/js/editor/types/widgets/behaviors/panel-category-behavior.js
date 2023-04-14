import CategoryEmptyView from '../views/category-empty-view';

export default class PanelCategoryBehavior extends Marionette.Behavior {
	initialize() {

	}

	onRender() {
		if ( this.isFavoritesCategory() ) {
			const hasFavorites = this.view.collection.length;
			if ( ! hasFavorites ) {
				this.$el.hide();
				return;
			}

			this.view.toggle( ! this.view.isEmpty(), false );
		}
	}

	isFavoritesCategory() {
		return 'favorites' === this.view.options.model.get( 'name' );
	}
}
