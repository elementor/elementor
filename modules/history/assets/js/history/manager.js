var ElementHistoryBehavior = require( './element-behavior' ),
	CollectionHistoryBehavior = require( './collection-behavior' );

var	Manager = function() {
	var self = this;

	var HistoryCollection = Backbone.Collection.extend( {
		model: Backbone.Model.extend( {
			type: '', // add/delete/move/change
			status: 'not_applied',
			elementType: '', // section/column/widget/control
			elementID: '',
			title: '', // Heading
			subTitle: '',
			action: '', // Added/Removed
			history: {
			}
		} )
	} );

	var items = new HistoryCollection();

	var translations = {
		add: elementor.translate( 'added' ),
		remove: elementor.translate( 'removed' ),
		change: elementor.translate( 'edited' ),
		move: elementor.translate( 'moved' ),
		duplicate: elementor.translate( 'duplicated' )
	};

	var addBehaviors = function( behaviors ) {
		behaviors.ElementHistory = {
			behaviorClass: ElementHistoryBehavior
		};

		behaviors.CollectionHistory = {
			behaviorClass: CollectionHistoryBehavior
		};

		return behaviors;
	};

	var addCollectionBehavior = function( behaviors ) {
		behaviors.CollectionHistory = {
			behaviorClass: CollectionHistoryBehavior
		};

		return behaviors;
	};

	var getActionLabel = function( itemData ) {
		if ( translations[ itemData.type ] ) {
			return translations[ itemData.type ];
		}

		return itemData.type;
	};

	var navigate = function( isRedo ) {
		var currentItem = items.find( function( model ) {
				return 'not_applied' ===  model.get( 'status' );
			} ),
			currentItemIndex = items.indexOf( currentItem ),
			requiredIndex = isRedo ? currentItemIndex - 1 : currentItemIndex + 1;

		if ( ( ! isRedo && ! currentItem ) || requiredIndex < 0  || requiredIndex >= items.length ) {
			return;
		}

		self.doItem( requiredIndex );

		var panel = elementor.getPanelView();

		if ( 'historyPage' === panel.getCurrentPageName() ) {
			panel.getCurrentPageView().render();
		}
	};

	var addHotKeys = function() {
		var H_KEY = 72,
			Z_KEY = 90;

		elementor.hotKeys.addHotKeyHandler( Z_KEY, 'historyNavigation', {
			isWorthHandling: function() {
				return items.length;
			},
			handle: function( event ) {
				navigate( Z_KEY === event.which && event.shiftKey );
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

	var init = function() {
		addHotKeys();

		elementor.hooks.addFilter( 'elements/base/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/column/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/section/behaviors', addBehaviors );
		elementor.hooks.addFilter( 'elements/base-section-container/behaviors', addCollectionBehavior );

		elementor.channels.data.on( 'drag:update', self.startMovingItem );
		elementor.channels.data.on( 'library:beforeInsertTemplate', self.startInsertTemplate );
	};

	this.trackingMode = true;

	this.getItems = function() {
		return items;
	};

	this.addItem = function( itemData ) {
		if ( ! this.trackingMode ) {
			return;
		}

		if ( ! items.length ) {
			items.add( {
				status: 'not_applied',
				title: 'Editing Started',
				subTitle: '',
				action: ''
			} );
		}

		// Remove old applied items from top of list
		while ( items.length && 'applied' === items.first().get( 'status' ) ) {
			items.shift();
		}

		var time = Math.round( new Date().getTime() / 1000 ),
			currentItem = items.findWhere( {
				time: time
			} );

		if ( ! currentItem ) {
			currentItem = new Backbone.Model();
			currentItem.set( 'time', time );
			currentItem.set( 'status', 'not_applied' );
			currentItem.set( 'items', new Backbone.Collection() );
			currentItem.set( 'title', itemData.title );
			currentItem.set( 'subTitle', itemData.subTitle ? itemData.subTitle : '' );
			currentItem.set( 'action', getActionLabel( itemData ) );

			self.startItemTitle = '';
			self.startItemAction = '';
		}

		currentItem.get( 'items' ).add( itemData, { at: 0 } );

		items.add( currentItem, { at: 0 } );

		var panel = elementor.getPanelView();

		if ( 'historyPage' === panel.getCurrentPageName() ) {
			panel.getCurrentPageView().render();
		}
	};

	this.doItem = function( index ) {
		// Don't track wile restore the item
		this.trackingMode = false;

		var item = items.at( index );

		if ( 'not_applied' === item.get( 'status' ) ) {
			this.undoItem( index );
		} else {
			this.redoItem( index );
		}

		this.trackingMode = true;
	};

	this.undoItem = function( index ) {
		var item;

		for ( var stepNum = 0; stepNum < index; stepNum++ ) {
			item = items.at( stepNum );

			if ( 'not_applied' === item.get( 'status' ) ) {
				item.get( 'items' ).each( function( subItem ) {
					if ( subItem.get( 'history' ) ) { /* type duplicate first items hasn't history */
						subItem.get( 'history' ).behavior.restore( subItem );
					}
				} );
				item.set( 'status', 'applied' );
			}
		}
	};

	this.redoItem = function( index ) {
		var item;
		for ( var stepNum = items.length - 1; stepNum >= index; stepNum-- ) {
			item = items.at( stepNum );

			if ( 'applied' === item.get( 'status' ) ) {
				var reversedSubItems = _.toArray( item.get( 'items' ).models ).reverse();
				_( reversedSubItems ).each( function( subItem ) {
					if ( subItem.get( 'history' ) ) { /* type duplicate first items hasn't history */
						subItem.get( 'history' ).behavior.restore( subItem, true );
					}
				} );

				item.set( 'status', 'not_applied' );
			}
		}
	};

	this.getModelLabel = function( model ) {
		return elementor.getElementData( model ).title;
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

	this.startMovingItem = function( model ) {
		elementor.history.history.addItem( {
			type: 'move',
			title: elementor.history.history.getModelLabel( model )
		} );
	};

	this.startInsertTemplate = function( model ) {
		elementor.history.history.addItem( {
			type: 'add',
			title: elementor.translate( 'Template' ),
			subTitle: model.get( 'title' )
		} );
	};

	init();
};

module.exports = new Manager();
