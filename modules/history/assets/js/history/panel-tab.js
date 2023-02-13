import ItemView from './item-view';
import EmptyView from './empty';

module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-history',

	template: '#tmpl-elementor-panel-history-tab',

	childView: ItemView,

	childViewContainer: '#elementor-history-list',

	emptyView: EmptyView,

	currentItem: null,

	updateCurrentItem() {
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

	onRender() {
		this.updateCurrentItem();
	},

	onRenderEmpty() {
		this.$el.addClass( 'elementor-empty' );
	},

	onChildviewClick( childView, event ) {
		if ( childView.$el === this.currentItem ) {
			return;
		}

		const collection = event.model.collection,
			index = collection.findIndex( event.model );

		$e.run( 'panel/history/actions/do', { index } );
	},
} );
