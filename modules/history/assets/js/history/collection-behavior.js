module.exports = Marionette.Behavior.extend( {
	initialize: function() {
		_.defer( _.bind( this.onStart, this ) );
	},

	onStart: function() {
		if ( this.view.collection ) {
			this.view.collection.on( 'update', this.saveCollectionHistory, this );
		}
	},

	onChildviewBeforeAdd: function( childView ) {
		elementor.history.history.addItem( {
			type: 'add',
			title: elementor.history.history.getModelLabel( childView.collection.models[0] )
		} );
	},

	onChildviewBeforeDuplicate: function( childView ) {
		elementor.history.history.addItem( {
			type: 'duplicate',
			title: elementor.history.history.getModelLabel( childView.model )
		} );
	},

	onChildviewElementRemoved: function( childView ) {
		elementor.history.history.addItem( {
			type: 'remove',
			title: elementor.history.history.getModelLabel( childView.model )
		} );
	},

	saveCollectionHistory: function( collection, event ) {
		var historyItem,
			model,
			type;

		if ( event.add ) {
			model = event.changes.added[0];
			type = 'add';
		} else {
			model = event.changes.removed[0];
			type = 'remove';
		}

		var title = elementor.history.history.getModelLabel( model );

		// If it's an unknown model - don't save
		if ( ! title ) {
			return;
		}

		historyItem = {
			type: type,
			elementType: model.get( 'elType' ),
			elementID: model.get( 'id' ),
			title: title,
			history: {
				behavior: this,
				collection: collection,
				event: event,
				model: model.toJSON( { copyHtmlCache: true } )
			}
		};

		elementor.history.history.addItem( historyItem );
	},

	add: function( model, toView, position ) {
		if ( 'section' === model.elType ) {
			model.dontFillEmpty = true;
		}

		toView.addChildModel( model, { at: position, silent: 0 } );
	},

	remove: function( model, fromCollection ) {
		fromCollection.remove( model, { silent: 0 } );
	},

	restore: function( historyItem, isRedo ) {
		var	type = historyItem.get( 'type' ),
			history = historyItem.get( 'history' ),
			didAction = false,
			behavior;

		// Find the new behavior and work with him
		if ( history.behavior.view.model ) {
			var modelID = history.behavior.view.model.get( 'id' ),
				view = elementor.history.history.findView( modelID );
			if ( view ) {
				behavior = view.getBehavior( 'CollectionHistory' );
			}
		}

		// Container or new Elements - Doesn't have a new behavior
		if ( ! behavior ) {
			behavior = history.behavior;
		}

		// Stop listen to undo actions
		behavior.view.collection.off( 'update', behavior.saveCollectionHistory );

		switch ( type ) {
			case 'add':
				if ( isRedo ) {
					this.add( history.model, behavior.view, history.event.index );
				} else {
					this.remove( history.model, behavior.view.collection );
				}

				didAction = true;
				break;
			case 'remove':
				if ( isRedo ) {
					this.remove( history.model, behavior.view.collection );
				} else {
					this.add( history.model, behavior.view, history.event.index );
				}

				didAction = true;
				break;
		}

		// Listen again
		behavior.view.collection.on( 'update', behavior.saveCollectionHistory, history.behavior );

		return didAction;
	}
} );

