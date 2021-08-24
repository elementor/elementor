module.exports = elementorModules.ViewModule.extend( {
	$element: null,

	editorListeners: null,

	onElementChange: null,

	onEditSettingsChange: null,

	onPageSettingsChange: null,

	isEdit: null,

	__construct: function( settings ) {
		if ( ! this.isActive( settings ) ) {
			return;
		}

		this.$element = settings.$element;

		this.isEdit = this.$element.hasClass( 'elementor-element-edit-mode' );

		if ( this.isEdit ) {
			this.addEditorListeners();
		}
	},

	isActive: function() {
		return true;
	},

	findElement: function( selector ) {
		var $mainElement = this.$element;

		return $mainElement.find( selector ).filter( function() {
			return jQuery( this ).closest( '.elementor-element' ).is( $mainElement );
		} );
	},

	getUniqueHandlerID: function( cid, $element ) {
		if ( ! cid ) {
			cid = this.getModelCID();
		}

		if ( ! $element ) {
			$element = this.$element;
		}

		return cid + $element.attr( 'data-element_type' ) + this.getConstructorID();
	},

	initEditorListeners: function() {
		var self = this;

		self.editorListeners = [
			{
				event: 'element:destroy',
				to: elementor.channels.data,
				callback: function( removedModel ) {
					if ( removedModel.cid !== self.getModelCID() ) {
						return;
					}

					self.onDestroy();
				},
			},
		];

		if ( self.onElementChange ) {
			const elementType = self.getWidgetType() || self.getElementType();

			let eventName = 'change';

			if ( 'global' !== elementType ) {
				eventName += ':' + elementType;
			}

			self.editorListeners.push( {
				event: eventName,
				to: elementor.channels.editor,
				callback: function( controlView, elementView ) {
					var elementViewHandlerID = self.getUniqueHandlerID( elementView.model.cid, elementView.$el );

					if ( elementViewHandlerID !== self.getUniqueHandlerID() ) {
						return;
					}

					self.onElementChange( controlView.model.get( 'name' ), controlView, elementView );
				},
			} );
		}

		if ( self.onEditSettingsChange ) {
			self.editorListeners.push( {
				event: 'change:editSettings',
				to: elementor.channels.editor,
				callback: function( changedModel, view ) {
					if ( view.model.cid !== self.getModelCID() ) {
						return;
					}

					self.onEditSettingsChange( Object.keys( changedModel.changed )[ 0 ] );
				},
			} );
		}

		[ 'page' ].forEach( function( settingsType ) {
			var listenerMethodName = 'on' + settingsType[ 0 ].toUpperCase() + settingsType.slice( 1 ) + 'SettingsChange';

			if ( self[ listenerMethodName ] ) {
				self.editorListeners.push( {
					event: 'change',
					to: elementor.settings[ settingsType ].model,
					callback: function( model ) {
						self[ listenerMethodName ]( model.changed );
					},
				} );
			}
		} );
	},

	getEditorListeners: function() {
		if ( ! this.editorListeners ) {
			this.initEditorListeners();
		}

		return this.editorListeners;
	},

	addEditorListeners: function() {
		var uniqueHandlerID = this.getUniqueHandlerID();

		this.getEditorListeners().forEach( function( listener ) {
			elementorFrontend.addListenerOnce( uniqueHandlerID, listener.event, listener.callback, listener.to );
		} );
	},

	removeEditorListeners: function() {
		var uniqueHandlerID = this.getUniqueHandlerID();

		this.getEditorListeners().forEach( function( listener ) {
			elementorFrontend.removeListeners( uniqueHandlerID, listener.event, null, listener.to );
		} );
	},

	getElementType: function() {
		return this.$element.data( 'element_type' );
	},

	getWidgetType: function() {
		const widgetType = this.$element.data( 'widget_type' );

		if ( ! widgetType ) {
			return;
		}

		return widgetType.split( '.' )[ 0 ];
	},

	getID: function() {
		return this.$element.data( 'id' );
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		let elementSettings = {};

		const modelCID = this.getModelCID();

		if ( this.isEdit && modelCID ) {
			const settings = elementorFrontend.config.elements.data[ modelCID ],
				attributes = settings.attributes;

			let type = attributes.widgetType || attributes.elType;

			if ( attributes.isInner ) {
				type = 'inner-' + type;
			}

			let settingsKeys = elementorFrontend.config.elements.keys[ type ];

			if ( ! settingsKeys ) {
				settingsKeys = elementorFrontend.config.elements.keys[ type ] = [];

				jQuery.each( settings.controls, ( name, control ) => {
					if ( control.frontend_available ) {
						settingsKeys.push( name );
					}
				} );
			}

			jQuery.each( settings.getActiveControls(), function( controlKey ) {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					let value = attributes[ controlKey ];

					if ( value.toJSON ) {
						value = value.toJSON();
					}

					elementSettings[ controlKey ] = value;
				}
			} );
		} else {
			elementSettings = this.$element.data( 'settings' ) || {};
		}

		return this.getItems( elementSettings, setting );
	},

	getEditSettings: function( setting ) {
		var attributes = {};

		if ( this.isEdit ) {
			attributes = elementorFrontend.config.elements.editSettings[ this.getModelCID() ].attributes;
		}

		return this.getItems( attributes, setting );
	},

	getCurrentDeviceSetting: function( settingKey ) {
		return elementorFrontend.getCurrentDeviceSetting( this.getElementSettings(), settingKey );
	},

	onInit: function() {
		if ( this.isActive( this.getSettings() ) ) {
			elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
		}
	},

	onDestroy: function() {
		if ( this.isEdit ) {
			this.removeEditorListeners();
		}

		if ( this.unbindEvents ) {
			this.unbindEvents();
		}
	},
} );
