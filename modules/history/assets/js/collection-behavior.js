module.exports = Marionette.Behavior.extend( {
	initialize: function() {
		_.defer( _.bind( this.onStart, this ) );
	},

	onStart: function() {
		if ( this.view.collection ) {
			this.view.collection.on( 'update', this.saveCollectionHistory, this );
		}
	},

	saveCollectionHistory: function( collection, event ) {
		var historyItem,
			model;

		if ( event.add ) {
			model = event.changes.added[0];

			historyItem = {
				type: 'add',
				elementType: model.get( 'elType' ),
				elementID: model.get( 'id' ),
				title: elementor.history.getModelLabel( model ) + ' Added',
				history: {
					behavior: this,
					collection: collection,
					event: event,
					model: model
				}
			};

			elementor.history.addItem( historyItem );
		} else {
			model = event.changes.removed[0];
			// Remove listeners and etc
			model.destroy();

			historyItem = {
				type: 'remove',
				elementType: model.get( 'elType' ),
				elementID: model.get( 'id' ),
				title: elementor.history.getModelLabel( model ) + ' Removed',
				history: {
					behavior: this,
					collection: collection,
					event: event,
					model: model
				}
			};

			elementor.history.addItem( historyItem );
		}
	},

	add: function( model, toView, position ) {
		if ( 'section' === model.get( 'elType' ) ) {
			model.get( 'editSettings' ).set( 'dontFillEmpty', true );
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
				view = elementor.history.findView( modelID );
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

