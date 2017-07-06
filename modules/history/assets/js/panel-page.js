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
		this.undoItem( this.children.length );

		this.updateCurrentItem( this.ui.reset );
	},



	onChildviewItemClick: function( childView, event ) {
		if ( childView.$el === this.currentItem ) {
			return;
		}

		var collection = event.model.collection,
			itemIndex = collection.findIndex( event.model );

		elementor.history.doItem( itemIndex );

		this.updateCurrentItem( childView.$el );

		this.render();
	}
} );
