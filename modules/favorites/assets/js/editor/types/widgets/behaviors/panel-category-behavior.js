export default class PanelCategoryBehavior extends Marionette.Behavior {
	onRender() {
		if ( this.isFavoritesCategory() ) {
			const hasFavorites = this.view.collection.length;
			if ( ! hasFavorites ) {
				this.$el.hide();
			}
		}
	}

	isFavoritesCategory() {
		return 'favorites' === this.view.options.model.get( 'name' );
	}
}
