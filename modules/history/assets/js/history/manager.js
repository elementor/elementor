import ItemModel from './item-model';
import Component from './component';

var	Manager = function() {
	var self = this,
		currentItemID = null,
		items = new Backbone.Collection( [], { model: ItemModel } ),
		editorSaved = false,
		active = true;

	const translations = {
		// Alphabetical order.
		add: elementor.translate( 'added' ),
		change: elementor.translate( 'edited' ),
		disable: elementor.translate( 'disabled' ),
		duplicate: elementor.translate( 'duplicate' ),
		enable: elementor.translate( 'enabled' ),
		move: elementor.translate( 'moved' ),
		paste: elementor.translate( 'pasted' ),
		paste_style: elementor.translate( 'style_pasted' ),
		remove: elementor.translate( 'removed' ),
		reset_style: elementor.translate( 'style_reset' ),
	};

	var getActionLabel = function( itemData ) {
		if ( translations[ itemData.type ] ) {
			return translations[ itemData.type ];
		}

		return itemData.type;
	};

	this.navigate = function( isRedo ) {
		var currentItem = items.find( function( model ) {
				return 'not_applied' === model.get( 'status' );
			} ),
			currentItemIndex = items.indexOf( currentItem ),
			requiredIndex = isRedo ? currentItemIndex - 1 : currentItemIndex + 1;

		if ( ( ! isRedo && ! currentItem ) || requiredIndex < 0 || requiredIndex >= items.length ) {
			return;
		}

		self.doItem( requiredIndex );
	};

	var updatePanelPageCurrentItem = function() {
		if ( $e.routes.is( 'panel/history/actions' ) ) {
			elementor.getPanelView().getCurrentPageView().getCurrentTab().updateCurrentItem();
		}
	};

	var onPanelSave = function() {
		if ( items.length >= 2 ) {
			// Check if it's a save after made changes, `items.length - 1` is the `Editing Started Item
			var firstEditItem = items.at( items.length - 2 );
			editorSaved = ( 'not_applied' === firstEditItem.get( 'status' ) );
		}
	};

	var init = function() {
		$e.components.register( new Component( { manager: self } ) );

		elementor.channels.editor.on( 'saved', onPanelSave );
	};

	this.setActive = function( value ) {
		active = value;
	};

	this.getActive = function() {
		return active;
	};

	this.getItems = function() {
		return items;
	};

	this.startItem = function( itemData ) {
		currentItemID = this.addItem( itemData );

		return currentItemID;
	};

	this.endItem = function( id ) {
		if ( id && currentItemID !== id ) {
			return;
		}
		currentItemID = null;
	};

	this.deleteItem = function( id ) {
		const item = items.findWhere( {
			id: id,
		} );

		items.remove( item );

		currentItemID = null;
	};

	this.isItemStarted = function() {
		return null !== currentItemID;
	};

	this.getCurrentId = function() {
		return currentItemID;
	};

	this.addItem = function( itemData ) {
		if ( ! this.getActive() ) {
			return;
		}

		if ( ! items.length ) {
			items.add( {
				status: 'not_applied',
				title: elementor.translate( 'editing_started' ),
				subTitle: '',
				action: '',
				editing_started: true,
			} );
		}

		// Remove old applied items from top of list
		while ( items.length && 'applied' === items.first().get( 'status' ) ) {
			items.shift();
		}

		var id = currentItemID ? currentItemID : new Date().getTime();

		var	currentItem = items.findWhere( {
			id: id,
		} );

		if ( ! currentItem ) {
			currentItem = new ItemModel( {
				id: id,
				title: itemData.title,
				subTitle: itemData.subTitle,
				action: getActionLabel( itemData ),
				type: itemData.type,
			} );

			self.startItemTitle = '';
			self.startItemAction = '';
		}

		currentItem.get( 'items' ).add( itemData, { at: 0 } );

		items.add( currentItem, { at: 0 } );

		updatePanelPageCurrentItem();

		return id;
	};

	this.doItem = function( index ) {
		// Don't track while restoring the item
		this.setActive( false );

		var item = items.at( index );

		if ( 'not_applied' === item.get( 'status' ) ) {
			this.undoItem( index );
		} else {
			this.redoItem( index );
		}

		this.setActive( true );

		var panel = elementor.getPanelView(),
			panelPage = panel.getCurrentPageView(),
			editedElementView = panelPage.getOption( 'editedElementView' ),
			viewToScroll;

		if ( $e.routes.isPartOf( 'panel/editor' ) && editedElementView ) {
			if ( editedElementView.isDestroyed ) {
				// If the the element isn't exist - show the history panel
				$e.route( 'panel/history/actions' );
			} else {
				// If element exist - render again, maybe the settings has been changed
				viewToScroll = editedElementView;
			}
		} else if ( item instanceof Backbone.Model && item.get( 'items' ).length ) {
			const historyItem = item.get( 'items' ).first();

			if ( historyItem.get( 'restore' ) ) {
				let container = 'sub-add' === historyItem.get( 'type' ) ?
					historyItem.get( 'data' ).containerToRestore :
					historyItem.get( 'container' ) || historyItem.get( 'containers' );

				if ( Array.isArray( container ) ) {
					container = container[ 0 ];
				}

				if ( container ) {
					viewToScroll = container.lookup().view;
				}
			}
		}

		updatePanelPageCurrentItem();

		if ( viewToScroll && ! elementor.helpers.isInViewport( viewToScroll.$el[ 0 ], elementor.$previewContents.find( 'html' )[ 0 ] ) ) {
			elementor.helpers.scrollToView( viewToScroll.$el );
		}

		if ( item.get( 'editing_started' ) ) {
			if ( ! editorSaved ) {
				elementor.saver.setFlagEditorChange( false );
			}
		}
	};

	this.undoItem = function( index ) {
		var item;

		for ( var stepNum = 0; stepNum < index; stepNum++ ) {
			item = items.at( stepNum );

			if ( 'not_applied' === item.get( 'status' ) ) {
				item.get( 'items' ).each( function( subItem ) {
					const restore = subItem.get( 'restore' );

					if ( restore ) {
						restore( subItem );
					}
				} );

				item.set( 'status', 'applied' );
			}
		}
	};

	this.redoItem = function( index ) {
		for ( var stepNum = items.length - 1; stepNum >= index; stepNum-- ) {
			var item = items.at( stepNum );

			if ( 'applied' === item.get( 'status' ) ) {
				var reversedSubItems = _.toArray( item.get( 'items' ).models ).reverse();

				_( reversedSubItems ).each( function( subItem ) {
					const restore = subItem.get( 'restore' );

					if ( restore ) {
						restore( subItem, true );
					}
				} );

				item.set( 'status', 'not_applied' );
			}
		}
	};

	init();
};

module.exports = new Manager();
