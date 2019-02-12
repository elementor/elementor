import ItemView from './item-view';
import EmptyView from './empty';

module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-history',

	template: '#tmpl-elementor-panel-history-tab',

	childView: ItemView,

	childViewContainer: '#elementor-history-list',

	emptyView: EmptyView,

	currentItem: null,

	updateCurrentItem: function() {
		if ( this.children.length <= 1 ) {
			return;
		}

		_.defer( () => {
			// Set current item - the first not applied item
			const currentItem = this.collection.find( function( model ) {
					return 'not_applied' === model.get( 'status' );
				} ),
				currentView = this.children.findByModel( currentItem );

			if ( ! currentView ) {
				return;
			}

			const currentItemClass = 'elementor-history-item-current';

			if ( this.currentItem ) {
				this.currentItem.removeClass( currentItemClass );
			}

			this.currentItem = currentView.$el;

			this.currentItem.addClass( currentItemClass );
		} );
	},

	onRender: function() {
		this.updateCurrentItem();
	},

	onRenderEmpty: function() {
		this.$el.addClass( 'elementor-empty' );
	},

	onChildviewClick: function( childView, event ) {
		if ( childView.$el === this.currentItem ) {
			return;
		}

		var collection = event.model.collection,
			itemIndex = collection.findIndex( event.model );

		elementor.history.history.doItem( itemIndex );
	},
} );
