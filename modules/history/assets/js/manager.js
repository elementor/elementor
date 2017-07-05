var HistoryPageView = require( './panel-page' ),
	Manager = function() {
	var self = this;

	var addPanelPage = function() {
		elementor.getPanelView().addPage( 'historyPage', {
			view: HistoryPageView,
			title: elementor.translate( 'history' ),
			options: {
				collection: self.items
			}
		} );
	};

	var addHotKeys = function() {
		var H_KEY = 72,
			Z_KEY = 90;

		elementor.hotKeys.addHotKeyHandler( Z_KEY, 'historyNavigation', {
			isWorthHandling: function() {
				return elementor.history.items.length;
			},
			handle: function( event ) {
				elementor.history.navigate( Z_KEY === event.which && event.shiftKey );
			}
		} );

		elementor.hotKeys.addHotKeyHandler( H_KEY, 'showHistoryPage', {
			isWorthHandling: function( event ) {
				return elementor.hotKeys.isControlEvent( event ) && event.shiftKey;
			},
			handle: function() {
				elementor.getPanelView().setPage( 'historyPage' );
			}
		} );
	};

	var normalizeItemTitle = function( item ) {
		var subItems = item.get( 'items' );

		// Check if it's a move action that in fact it's two action remove + add or between section it's add + remove
		if ( 2 === subItems.length ) {
			var firstItemType = subItems.at( 0 ).get( 'type' ),
				secondItemType = subItems.at( 1 ).get( 'type' );

			if ( ( 'add' === firstItemType && 'remove' === secondItemType ) || ( 'remove' === firstItemType && 'add' === secondItemType ) ) {
				var model = subItems.at( 0 ).get( 'history' ).model,
					modelLabel = elementor.history.getModelLabel( model );
				item.set( 'title', modelLabel + ' Moved' );
				return item;
			}
		}

		// Check if it's a remove of a complete cection / column
		if ( 1 < subItems.length ) {
			var lastItem = subItems.first(),
				elementType = lastItem.get( 'elementType' );
			if ( 'remove' === lastItem.get( 'type' ) && ( 'section' === elementType || 'column' === elementType ) ) {
				var model = lastItem.get( 'history' ).model,
					modelLabel = elementor.history.getModelLabel( model );
				item.set( 'title', modelLabel + ' Removed' );
				return item;
			}
		}

		return item;
	};

	var HistoryCollection = Backbone.Collection.extend( {
		model: Backbone.Model.extend( {
			type: '', // add/delete/move/change
			elementType: '', // section/column/widget/control
			elementID: '',
			title: '', // Widget Heading moved
			status: 'not_applied',
			history: {
			}
		} )
	} );

	var addBehaviors = function( behaviors ) {
			behaviors.ElementHistory = {
				behaviorClass: require( 'modules/history/assets/js/element-behavior' )
			};

			behaviors.CollectionHistory = {
				behaviorClass: require( 'modules/history/assets/js/collection-behavior' )
			};

			return behaviors;
		};

	var addCollectionBehavior = function( behaviors ) {
		behaviors.CollectionHistory = {
			behaviorClass: require( 'modules/history/assets/js/collection-behavior' )
		};

		return behaviors;
	};

	var addMenu = function( items ) {
		var itemsPartA = items.slice( 0, 3 ),
			itemsPartB = items.slice( 3, items.length );

		items = itemsPartA.concat( [ {
			icon: 'fa fa-history',
			title: elementor.translate( 'history' ),
			type: 'page',
			pageName: 'historyPage'
		} ], itemsPartB );
		return items;
	};

	var init = function() {
		addHotKeys();

		elementor.on( 'preview:loaded', addPanelPage );
		elementor.hooks.addFilter( 'elements/base/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/section/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/column/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/column/behaviors', addCollectionBehavior );
		elementor.hooks.addFilter( 'panel/menu/items', addMenu );
	};

	this.items = new HistoryCollection();

	this.addItem = function( itemData ) {
		if ( ! this.items.length ) {
			this.items.add( {
				status: 'not_applied',
				title: 'Editing Started'
			} );
		}


		// Remove old applied items from top of list
		while ( this.items.length && 'applied' === this.items.first().get( 'status' ) ) {
			this.items.shift();
		}

		var time = Math.round( new Date().getTime() / 1000 ),
			currentItem = this.items.findWhere( {
				time: time
			} );

		if ( ! currentItem ) {
			currentItem = new Backbone.Model();
			currentItem.set( 'time', time );
			currentItem.set( 'items', new Backbone.Collection() );
			currentItem.set( 'title', itemData.title );
			currentItem.set( 'status', 'not_applied' );
		}

		currentItem.get( 'items' ).add( itemData, { at: 0 } );

		currentItem = normalizeItemTitle( currentItem );

		this.items.add( currentItem, { at: 0 } );

		var panel = elementor.getPanelView();

		if ( 'historyPage' === panel.getCurrentPageName() ) {
			panel.getCurrentPageView().render();
		}
	};

	this.navigate = function( isRedo ) {
		var currentItem = this.items.find( function( model ) {
				return 'not_applied' ===  model.get( 'status' );
			} ),
			currentItemIndex = this.items.indexOf( currentItem ),
			requiredIndex = isRedo ? currentItemIndex - 1 : currentItemIndex;

		if ( ! isRedo && ! currentItem ) {
			return;
		}

		if ( requiredIndex < 0 ) {
			requiredIndex = this.items.length - 1;
		}

		if ( requiredIndex >= this.items.length ) {
			requiredIndex = 0;
		}

		this.items.at( requiredIndex ).get( 'items' ).each( function( subItem ) {
			subItem.get( 'history' ).behavior.restore( subItem, isRedo );
		} );

		var panel = elementor.getPanelView();

		if ( 'historyPage' === panel.getCurrentPageName() ) {
			panel.getCurrentPageView().render();
		}
	};

	this.getModelLabel = function( model ) {
		switch ( model.get( 'elType' ) ) {
			case 'section':
				return 'Section';
			case 'column':
				return 'Column';
			case 'widget':
				return model.get( 'widgetType' );
		}
	};

	this.findView = function( modelID, views ) {
		var self = this,
			founded = false;

		if ( ! views ) {
			views = elementor.sections.currentView.children;
		}

		_.each( views._views, function( view ) {
			if ( founded ) {
				return;
			}
			// Widget global used getEditModel
			var model = view.getEditModel ? view.getEditModel() : view.model;
			if ( modelID === model.get( 'id' ) ) {
				founded = view;
			} else if ( view.children && view.children.length ) {
				founded = self.findView( modelID, view.children );
			}
		} );

		return founded;
	};

	jQuery( window ).on( 'elementor:init', init );
};

module.exports = new Manager();
