module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-history',

	template: '#tmpl-elementor-panel-history',

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

	initialize: function() {
		this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged );
	},

	onClearClick: function() {
		elementor.history.items.reset();
	},

	onCollectionChanged: function() {
		if ( ! this.collection.length ) {
			var HistoryEmptyView = Marionette.ItemView.extend( {
				template: '#tmpl-elementor-panel-history-no-items',
				id: 'elementor-panel-history-no-items',
				className: 'elementor-panel-nerd-box'
			} );
			elementor.getPanelView().getRegion( 'content' ).show( new HistoryEmptyView() );
		}
	},

	onRender: function() {
		var self = this;

		_.defer( function() {
			// Render empty page if needed
			self.collection.trigger( 'reset' );

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
		for ( var stepNum = 0; stepNum < this.children.length; stepNum++ ) {
			childView = this.children.findByIndex( stepNum );

			if ( 'not_applied' === childView.model.get( 'status' ) ) {

				childView.model.get( 'items' ).each( function( subItem ) {
					subItem.get( 'history' ).behavior.restore( subItem );
				} );

				if ( ! childView.isDestroyed ) {
					childView.render();
				}
			}
		}

		this.updateCurrentItem( this.ui.reset );
	},

	onChildviewItemClick: function( childView, event ) {
		if ( childView.$el === this.currentItem ) {
			return;
		}

		var collection = event.model.collection,
			itemIndex = collection.findIndex( event.model ),
			item,
			stepNum;

		// Handle Undo
		if ( 'not_applied' === childView.model.get( 'status' ) ) {
			for ( stepNum = 0; stepNum < itemIndex; stepNum++ ) {
				item = collection.at( stepNum );

				if ( 'not_applied' === item.get( 'status' ) ) {
					item.get( 'items' ).each( function( subItem ) {
						subItem.get( 'history' ).behavior.restore( subItem );
					} );

					item.set( 'status', 'applied' );

					if ( ! childView.isDestroyed ) {
						childView._parent.children.findByModel( item ).render();
					}
				}
			}
		} else {
			// Handle Redo
			for ( stepNum = collection.length - 1; stepNum >= itemIndex; stepNum-- ) {
				item = collection.at( stepNum );

				if ( 'applied' === item.get( 'status' ) ) {
					var reversedSubItems = _.toArray( item.get( 'items' ).models ).reverse();
					_( reversedSubItems ).each( function( subItem ) {
						subItem.get( 'history' ).behavior.restore( subItem, true );
					} );

					item.set( 'status', 'not_applied' );

					if ( ! childView.isDestroyed ) {
						childView._parent.children.findByModel( item ).render();
					}
				}
			}
		}

		this.updateCurrentItem( childView.$el );
	}
} );
