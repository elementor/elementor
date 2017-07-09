module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-history',

	template: '#tmpl-elementor-panel-history-tab',

	childView: Marionette.ItemView.extend( {
		template: '#tmpl-elementor-panel-history-item',
		ui: {
			item: '.elementor-history-item'
		},
		triggers: {
			'click @ui.item': 'item:click'
		}
	} ),

	childViewContainer: '#elementor-history-list',

	currentItem: null,

	ui: {
		clear: '.elementor-panel-scheme-discard .elementor-button',
		reset: '.elementor-history-reset',
	},

	events: {
		'click @ui.clear': 'onClearClick',
		'click @ui.reset': 'onResetClick'
	},

	onRender: function() {
		var self = this;

		_.defer( function() {
			// Set current item - the first not applied item
			if ( self.children.length ) {
				var currentItem = self.collection.find( function( model ) {
						return 'not_applied' ===  model.get( 'status' );
					} ),
					currentView = self.children.findByModel( currentItem );

				self.updateCurrentItem( currentView.$el );
			}
		} );
	},

	updateCurrentItem: function( element ) {
		var currentItemClass = 'elementor-history-item-current';

		if ( this.currentItem ) {
			this.currentItem.removeClass( currentItemClass );
		}

		this.currentItem = element;

		this.currentItem.addClass( currentItemClass );
	},

	onResetClick: function() {
		var childView;

		// Handle Undo
		this.undoItem( this.children.length );

		this.updateCurrentItem( this.ui.reset );
	},

	onChildviewItemClick: function( childView, event ) {
		if ( childView.$el === this.currentItem ) {
			return;
		}

		var collection = event.model.collection,
			itemIndex = collection.findIndex( event.model );

		elementor.history.history.doItem( itemIndex );

		this.updateCurrentItem( childView.$el );

		this.render();
	}
} );
