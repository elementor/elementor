import CategoryEmptyView from '../views/category-empty-view';

export default Marionette.Behavior.extend( {
	initialize: function() {
		if ( this.isFavoritesCategory() ) {
			this.view.emptyView = CategoryEmptyView;
		}
	},

	onRender: function() {
		if ( this.isFavoritesCategory() ) {
			this.view.toggle( ! this.view.isEmpty() );
		}
	},

	isFavoritesCategory: function() {
		return 'favorites' === this.view.options.model.get( 'name' );
	},
} );
