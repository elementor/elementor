export default class Base extends elementorModules.ViewModuleFrontend {
	baseElement = null;

	editorListeners = null;

	onElementChange = null;

	onEditSettingsChange = null;

	onPageSettingsChange = null;

	isEdit = null;

	isJqueryRequired = null;

	__construct( settings ) {
		super.__construct( settings );

		if ( ! this.isActive( settings ) ) {
			return;
		}

		this.baseElement = settings.baseElement;

		this.isEdit = this.baseElement?.classList?.contains( 'elementor-element-edit-mode' );

		if ( this.isEdit ) {
			this.addEditorListeners();
		}
	}

	isActive() {
		return true;
	}

	isElementInTheCurrentDocument() {
		if ( ! elementorFrontend.isEditMode() ) {
			return false;
		}

		return elementor.documents.currentDocument.id.toString() === this.baseElement?.closest( '.elementor' )?.dataset?.elementorId;
	}

	findElement( selector ) {
		const mainElement = this.baseElement,
			rawElements = mainElement?.querySelectorAll( selector );

		if ( ! rawElements ) {
			return;
		}

		return Array.from( rawElements ).filter( ( element ) => {
			// Start `closest` from parent since self can be `.elementor-element`.
			const closestElement = element.parentNode?.closest( '.elementor-element' );
			return closestElement === mainElement;
		} );
	}

	getUniqueHandlerID( cid, baseElement ) {
		if ( ! cid ) {
			cid = this.getModelCID();
		}

		if ( ! baseElement ) {
			baseElement = !! this.baseElement ? this.baseElement : this.getSettings( 'baseElement' );
		}

		const elementType = !! window.jQuery && !! baseElement.jquery
			? baseElement.attr( 'data-element_type' )
			: baseElement.getAttribute( 'data-element_type' );

		return cid + elementType + this.getConstructorID();
	}

	initEditorListeners() {
		var self = this;

		self.editorListeners = [
			{
				event: 'element:destroy',
				to: elementor.channels.data,
				callback( removedModel ) {
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
				callback( controlView, elementView ) {
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
				callback( changedModel, view ) {
					if ( view.model.cid !== self.getModelCID() ) {
						return;
					}

					const propName = Object.keys( changedModel.changed )[ 0 ];

					self.onEditSettingsChange( propName, changedModel.changed[ propName ] );
				},
			} );
		}

		[ 'page' ].forEach( function( settingsType ) {
			var listenerMethodName = 'on' + settingsType[ 0 ].toUpperCase() + settingsType.slice( 1 ) + 'SettingsChange';

			if ( self[ listenerMethodName ] ) {
				self.editorListeners.push( {
					event: 'change',
					to: elementor.settings[ settingsType ].model,
					callback( model ) {
						self[ listenerMethodName ]( model.changed );
					},
				} );
			}
		} );
	}

	getEditorListeners() {
		if ( ! this.editorListeners ) {
			this.initEditorListeners();
		}

		return this.editorListeners;
	}

	addEditorListeners() {
		var uniqueHandlerID = this.getUniqueHandlerID();

		this.getEditorListeners().forEach( function( listener ) {
			elementorFrontend.addListenerOnce( uniqueHandlerID, listener.event, listener.callback, listener.to );
		} );
	}

	removeEditorListeners() {
		var uniqueHandlerID = this.getUniqueHandlerID();

		this.getEditorListeners().forEach( function( listener ) {
			elementorFrontend.removeListeners( uniqueHandlerID, listener.event, null, listener.to );
		} );
	}

	getElementType() {
		return this.baseElement?.dataset?.element_type;
	}

	getWidgetType() {
		const widgetType = this.baseElement?.dataset?.widget_type;

		if ( ! widgetType ) {
			return;
		}

		return widgetType.split( '.' )[ 0 ];
	}

	getID() {
		return this.baseElement?.dataset?.id;
	}

	getModelCID() {
		return this.baseElement?.dataset?.modelCid;
	}

	getElementSettings( setting ) {
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

				Object.entries( settings.controls ).forEach( ( [ name, control ] ) => {
					if ( control.frontend_available || control.editor_available ) {
						settingsKeys.push( name );
					}
				} );
			}

			Object.keys( settings.getActiveControls() )?.forEach( ( controlKey ) => {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					let value = attributes[ controlKey ];

					if ( value.toJSON ) {
						value = value.toJSON();
					}

					elementSettings[ controlKey ] = value;
				}
			} );
		} else {
			elementSettings = this.baseElement?.dataset?.settings || {};
		}

		return this.getItems( elementSettings, setting );
	}

	getEditSettings( setting ) {
		let attributes = {};

		if ( this.isEdit ) {
			attributes = elementorFrontend.config.elements.editSettings[ this.getModelCID() ].attributes;
		}

		return this.getItems( attributes, setting );
	}

	getCurrentDeviceSetting( settingKey ) {
		return elementorFrontend.getCurrentDeviceSetting( this.getElementSettings(), settingKey );
	}

	onInit( ...args ) {
		if ( null === this.isJqueryRequired ) {
			this.isJqueryRequired = true;
		}

		if ( ! this.baseElement ) {
			this.baseElement = this.getSettings( 'baseElement' );
		}

		if ( !! window.jQuery ) {
			this.$element = jQuery( this.baseElement );
		}

		super.onInit( ...args );

		if ( this.isActive( this.getSettings() ) ) {
			elementorModules.ViewModuleFrontend.prototype.onInit.apply( this, arguments );
		}
	}

	onDestroy() {
		if ( this.isEdit ) {
			this.removeEditorListeners();
		}

		if ( this.unbindEvents ) {
			this.unbindEvents();
		}
	}
}
