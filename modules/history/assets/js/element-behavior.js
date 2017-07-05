module.exports = Marionette.Behavior.extend( {
	initialize: function() {
		_.defer( _.bind( this.onStart, this ) );
	},

	onStart: function() {
		this.listenTo( this.view.getEditModel().get( 'settings' ), 'change', this.saveHistory );
	},

	saveHistory: function( model ) {
		var changed = Object.keys( model.changed );
		if ( ! changed.length || ! model.controls[ changed[0] ] ) {
			return;
		}

		var changedAttributes = {};

		_.each( changed, function( controlName ) {
			changedAttributes[ controlName ] = {
				old: model.previous( controlName ),
				'new': model.get( controlName )
			};
		} );

		var historyItem = {
			type: 'change',
			elementType: 'control',
			status: 'not_applied',
			title: elementor.history.getModelLabel( model ) + ' Edited',
			history: {
				behavior: this,
				changed: changedAttributes,
			}
		};

		if ( 1 === changed.length && model.controls[ changed[0] ] ) {
			historyItem.title = elementor.history.getModelLabel( model ) + ':' + model.controls[ changed[0] ].label + ' Changed';
		}

		elementor.history.addItem( historyItem );
	},

	restore: function( historyItem, isRedo ) {
		var	type = historyItem.get( 'type' ),
			history = historyItem.get( 'history' ),
			modelID = history.behavior.view.model.get( 'id' ),
			view = elementor.history.findView( modelID ),
			model = view.getEditModel ? view.getEditModel() : view.model,
			settings = model.get( 'settings' ),
			behavior = view._behaviors[ Object.keys( view.behaviors ).indexOf( 'ElementHistory' ) ];

		// Stop listen to restore actions
		behavior.stopListening( model, 'change', behavior.saveHistory );

		_.each( history.changed, function( values, key ) {
			if ( isRedo ) {
				model.set( key, values['new'] );
			} else {
				model.set( key, values.old );
			}
		} );

		historyItem.set( 'status', isRedo ? 'not_applied' : 'applied' );

		// Listen again
		behavior.listenTo( model, 'change', behavior.saveHistory );
	}
} );

