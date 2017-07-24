module.exports = Marionette.Behavior.extend( {
	onBeforeRender: function() {
		this.listenTo( this.view.getEditModel().get( 'settings' ), 'change', this.saveHistory );
	},

	oldValues: [],

	saveTextHistory: function( model, changed, control ) {
		var changedAttributes = {};

		changedAttributes[ control.name ] = {
			old: this.oldValues[ control.name ],
			'new': model.get( control.name )
		};

		var historyItem = {
			type: 'change',
			elementType: 'control',
			title: elementor.history.history.getModelLabel( model ),
			subTitle: model.controls[ changed[0] ].label,
			history: {
				behavior: this,
				changed: changedAttributes,
				model: this.view.getEditModel().toJSON()
			}
		};

		elementor.history.history.addItem( historyItem );
	},

	saveHistory: function( model ) {
		var self = this,
			changed = Object.keys( model.changed );

		if ( ! changed.length || ! model.controls[ changed[0] ] ) {
			return;
		}

		if ( 1 === changed.length ) {
			var control = model.controls[ changed[0] ];

			if ( 'text' === control.type || 'textarea' === control.type ) {

				// Text fields - save only on blur, set the callback once on first change
				if ( ! self.oldValues[ control.name ] ) {
					self.oldValues[ control.name ] = model.previous( control.name );

					var panelView = elementor.getPanelView().getCurrentPageView(),
						controlModel = panelView.collection.findWhere( { name: control.name } ),
						view = panelView.children.findByModel( controlModel ),
						$input = view.$el.find( ':input' );

					$input.on( 'blur.history', function() {
						self.saveTextHistory( model, changed, control );

						delete self.oldValues[ control.name ];

						$input.off( 'blur.history' );
					} );
				}

				return;
			}
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
			title: elementor.history.history.getModelLabel( model ),
			history: {
				behavior: this,
				changed: changedAttributes,
				model: this.view.getEditModel().toJSON()
			}
		};

		if ( 1 === changed.length ) {
			historyItem.subTitle = model.controls[ changed[0] ].label;
		}

		elementor.history.history.addItem( historyItem );
	},

	restore: function( historyItem, isRedo ) {
		var	history = historyItem.get( 'history' ),
			modelID = history.model.id,
			view = elementor.history.history.findView( modelID );

		if ( ! view ) {
			return;
		}

		var model = view.getEditModel ? view.getEditModel() : view.model,
			settings = model.get( 'settings' ),
			behavior = view.getBehavior( 'ElementHistory' );

		// Stop listen to restore actions
		behavior.stopListening( settings, 'change', this.saveHistory );

		_.each( history.changed, function( values, key ) {
			if ( isRedo ) {
				settings.set( key, values['new'] );
			} else {
				settings.set( key, values.old );
			}
		} );

		historyItem.set( 'status', isRedo ? 'not_applied' : 'applied' );

		// Listen again
		behavior.listenTo( settings, 'change', this.saveHistory );
	}
} );
