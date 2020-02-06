import ItemModel from './item-model';

/**
 * TODO: consider refactor this class.
 * TODO: should be `Document/History` component.
 * TODO: should be attached to elementor.history.history + BC.
 */
export default class HistoryManager {
	currentItemID = null;

	items = new Backbone.Collection( [], { model: ItemModel } );

	editorSaved = false;

	active = true;

	translations = {
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
		reset_settings: elementor.translate( 'settings_reset' ),
	};

	initialize() {
		elementor.channels.editor.on( 'saved', this.onPanelSave.bind( this ) );
	}

	getActionLabel( itemData ) {
		// TODO: this function should be static.
		if ( this.translations[ itemData.type ] ) {
			return this.translations[ itemData.type ];
		}

		return itemData.type;
	}

	navigate( isRedo ) {
		const currentItem = this.items.find( ( model ) => {
				return 'not_applied' === model.get( 'status' );
			} ),
			currentItemIndex = this.items.indexOf( currentItem ),
			requiredIndex = isRedo ? currentItemIndex - 1 : currentItemIndex + 1;

		if ( ( ! isRedo && ! currentItem ) || requiredIndex < 0 || requiredIndex >= this.items.length ) {
			return;
		}

		this.doItem( requiredIndex );
	}

	setActive( value ) {
		this.active = value;
	}

	getActive( value ) {
		return this.active;
	}

	getItems() {
		return this.items;
	}

	startItem( itemData ) {
		this.currentItemID = this.addItem( itemData );

		return this.currentItemID;
	}

	endItem( id ) {
		if ( this.currentItemID !== id ) {
			return;
		}

		this.currentItemID = null;
	}

	deleteItem( id ) {
		const item = this.items.findWhere( {
			id: id,
		} );

		this.items.remove( item );

		this.currentItemID = null;
	}

	isItemStarted() {
		return null !== this.currentItemID;
	}

	getCurrentId() {
		return this.currentItemID;
	}

	addItem( itemData ) {
		if ( ! this.getActive() ) {
			return;
		}

		if ( ! this.items.length ) {
			this.items.add( {
				status: 'not_applied',
				title: elementor.translate( 'editing_started' ),
				subTitle: '',
				action: '',
				editing_started: true,
			} );
		}

		// Remove old applied items from top of list
		while ( this.items.length && 'applied' === this.items.first().get( 'status' ) ) {
			this.items.shift();
		}

		const id = this.currentItemID ? this.currentItemID : new Date().getTime();

		let currentItem = this.items.findWhere( {
			id: id,
		} );

		if ( ! currentItem ) {
			currentItem = new ItemModel( {
				id: id,
				title: itemData.title,
				subTitle: itemData.subTitle,
				action: this.getActionLabel( itemData ),
				type: itemData.type,
			} );

			this.startItemTitle = '';
			this.startItemAction = '';
		}

		currentItem.get( 'items' ).add( itemData, { at: 0 } );

		this.items.add( currentItem, { at: 0 } );

		this.updatePanelPageCurrentItem();

		return id;
	}

	doItem( index ) {
		// Don't track while restoring the item
		this.setActive( false );

		const item = this.items.at( index );

		if ( 'not_applied' === item.get( 'status' ) ) {
			this.undoItem( index );
		} else {
			this.redoItem( index );
		}

		this.setActive( true );

		const panel = elementor.getPanelView(),
			panelPage = panel.getCurrentPageView(),
			editedElementView = panelPage.getOption( 'editedElementView' );

		let viewToScroll;

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

		this.updatePanelPageCurrentItem();

		if ( viewToScroll && ! elementor.helpers.isInViewport( viewToScroll.$el[ 0 ], elementor.$previewContents.find( 'html' )[ 0 ] ) ) {
			elementor.helpers.scrollToView( viewToScroll.$el );
		}

		if ( item.get( 'editing_started' ) ) {
			if ( ! this.editorSaved ) {
				$e.internal( 'document/save/set-is-modified', { status: false } );
			}
		}
	}

	undoItem( index ) {
		for ( let stepNum = 0; stepNum < index; stepNum++ ) {
			const item = this.items.at( stepNum );

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
	}

	redoItem( index ) {
		for ( let stepNum = this.items.length - 1; stepNum >= index; stepNum-- ) {
			const item = this.items.at( stepNum );

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
	}

	updatePanelPageCurrentItem() {
		if ( $e.routes.is( 'panel/history/actions' ) ) {
			elementor.getPanelView().getCurrentPageView().getCurrentTab().updateCurrentItem();
		}
	}

	onPanelSave() {
		if ( this.items.length >= 2 ) {
			// Check if it's a save after made changes, `items.length - 1` is the `Editing Started Item
			const firstEditItem = items.at( items.length - 2 );

			this.editorSaved = ( 'not_applied' === firstEditItem.get( 'status' ) );
		}
	}
}
