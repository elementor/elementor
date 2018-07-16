var BaseSettingsModel = require( 'elementor-elements/models/base-settings' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' ),
	Validator = require( 'elementor-validator/base' ),
	BaseContainer = require( 'elementor-views/base-container' ),
	BaseElementView;

BaseElementView = BaseContainer.extend( {
	tagName: 'div',

	controlsCSSParser: null,

	allowRender: true,

	renderAttributes: {},

	className: function() {
		return 'elementor-element elementor-element-edit-mode ' + this.getElementUniqueID();
	},

	attributes: function() {
		var type = this.model.get( 'elType' );

		if ( 'widget'  === type ) {
			type = this.model.get( 'widgetType' );
		}

		return {
			'data-id': this.getID(),
			'data-element_type': type
		};
	},

	ui: function() {
		return {
			editButton: '> .elementor-element-overlay .elementor-editor-element-edit'
		};
	},

	behaviors: function() {
		var groups = elementor.hooks.applyFilters( 'elements/' + this.options.model.get( 'elType' ) + '/contextMenuGroups', this.getContextMenuGroups(), this );

		var behaviors = {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: groups
			}
		};

		return elementor.hooks.applyFilters( 'elements/base/behaviors', behaviors, this );
	},

	getBehavior: function( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	events: function() {
		return {
			'click @ui.editButton': 'onEditButtonClick'
		};
	},

	getElementType: function() {
		return this.model.get( 'elType' );
	},

	getIDInt: function() {
		return parseInt( this.getID(), 16 );
	},

	getChildType: function() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	getChildView: function( model ) {
		var ChildView,
			elType = model.get( 'elType' );

		if ( 'section' === elType ) {
			ChildView = require( 'elementor-elements/views/section' );
		} else if ( 'column' === elType ) {
			ChildView = require( 'elementor-elements/views/column' );
		} else {
			ChildView = elementor.modules.elements.views.Widget;
		}

		return elementor.hooks.applyFilters( 'element/view', ChildView, model, this );
	},

	// TODO: backward compatibility method since 1.8.0
	templateHelpers: function() {
		var templateHelpers = BaseContainer.prototype.templateHelpers.apply( this, arguments );

		return jQuery.extend( templateHelpers, {
			editModel: this.getEditModel() // @deprecated. Use view.getEditModel() instead.
		} );
	},

	getTemplateType: function() {
		return 'js';
	},

	getEditModel: function() {
		return this.model;
	},

	getContextMenuGroups: function() {
		var elementType = this.options.model.get( 'elType' ),
			controlSign = elementor.envData.mac ? '⌘' : '^';

		return [
			{
				name: 'general',
				actions: [
					{
						name: 'edit',
						title: elementor.translate( 'edit_element', [ elementor.helpers.firstLetterUppercase( elementType ) ] ),
						callback: this.options.model.trigger.bind( this.options.model, 'request:edit' )
					}, {
						name: 'duplicate',
						title: elementor.translate( 'duplicate' ),
						shortcut: controlSign + '+D',
						callback: this.duplicate.bind( this )
					}
				]
			}, {
				name: 'transfer',
				actions: [
					{
						name: 'copy',
						title: elementor.translate( 'copy' ),
						shortcut: controlSign + '+C',
						callback: this.copy.bind( this )
					}, {
						name: 'paste',
						title: elementor.translate( 'paste' ),
						shortcut: controlSign + '+V',
						callback: this.paste.bind( this ),
						isEnabled: this.isPasteEnabled.bind( this )
					}, {
						name: 'pasteStyle',
						title: elementor.translate( 'paste_style' ),
						callback: this.pasteStyle.bind( this ),
						isEnabled: function() {
							return !! elementor.getStorage( 'transfer' );
						}
					}, {
						name: 'resetStyle',
						title: elementor.translate( 'reset_style' ),
						callback: this.resetStyle.bind( this )
					}
				]
			}, {
				name: 'delete',
				actions: [
					{
						name: 'delete',
						title: elementor.translate( 'delete' ),
						shortcut: '⌦',
						callback: this.removeElement.bind( this )
					}
				]
			}
		];
	},

	initialize: function() {
		BaseContainer.prototype.initialize.apply( this, arguments );

		if ( this.collection ) {
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		var editModel = this.getEditModel();

		this.listenTo( editModel.get( 'settings' ), 'change', this.onSettingsChanged )
			.listenTo( editModel.get( 'editSettings' ), 'change', this.onEditSettingsChanged )
			.listenTo( this.model, 'request:edit', this.onEditRequest )
			.listenTo( this.model, 'request:toggleVisibility', this.toggleVisibility );

		this.initControlsCSSParser();
	},

	startTransport: function( type ) {
		elementor.setStorage( 'transfer', {
			type: type,
			elementsType: this.getElementType(),
			elements: [ this.model.toJSON( { copyHtmlCache: true } ) ]
		} );
	},

	copy: function() {
		this.startTransport( 'copy' );
	},

	cut: function() {
		this.startTransport( 'cut' );
	},

	paste: function() {
		this.trigger( 'request:paste' );
	},

	isPasteEnabled: function() {
		var transferData = elementor.getStorage( 'transfer' );

		if ( ! transferData || this.isCollectionFilled() ) {
			return false;
		}

		return this.getElementType() === transferData.elementsType;
	},

	isStyleTransferControl: function( control ) {
		if ( undefined !== control.style_transfer ) {
			return control.style_transfer;
		}

		return 'content' !== control.tab || control.selectors || control.prefix_class;
	},

	duplicate: function() {
		var oldTransport = elementor.getStorage( 'transfer' );

		this.copy();

		this.paste();

		elementor.setStorage( 'transfer', oldTransport );
	},

	pasteStyle: function() {
		var self = this,
			transferData = elementor.getStorage( 'transfer' ),
			sourceElement = transferData.elements[0],
			sourceSettings = sourceElement.settings,
			editModel = self.getEditModel(),
			settings = editModel.get( 'settings' ),
			settingsAttributes = settings.attributes,
			controls = settings.controls,
			diffSettings = {};

		jQuery.each( controls, function( controlName, control ) {
			if ( ! self.isStyleTransferControl( control ) ) {
				return;
			}

			var sourceValue = sourceSettings[ controlName ],
				targetValue = settingsAttributes[ controlName ];

			if ( undefined === sourceValue || undefined === targetValue ) {
				return;
			}

			if ( 'object' === typeof sourceValue ) {
				if ( 'object' !== typeof targetValue ) {
					return;
				}

				var isEqual = true;

				jQuery.each( sourceValue, function( propertyKey ) {
					if ( sourceValue[ propertyKey ] !== targetValue[ propertyKey ] ) {
						return isEqual = false;
					}
				} );

				if ( isEqual ) {
					return;
				}
			} else {
				if ( sourceValue === targetValue ) {
					return;
				}
			}

			var ControlView = elementor.getControlView( control.type );

			if ( ! ControlView.onPasteStyle( control, sourceValue ) ) {
				return;
			}

			diffSettings[ controlName ] = sourceValue;
		} );

		self.allowRender = false;

		elementor.channels.data.trigger( 'element:before:paste:style', editModel );

		editModel.setSetting( diffSettings );

		elementor.channels.data.trigger( 'element:after:paste:style', editModel );

		self.allowRender = true;

		self.renderOnChange();
	},

	resetStyle: function() {
		var self = this,
			editModel = self.getEditModel(),
			controls = editModel.get( 'settings' ).controls,
			defaultValues = {};

		self.allowRender = false;

		elementor.channels.data.trigger( 'element:before:reset:style', editModel );

		jQuery.each( controls, function( controlName, control ) {
			if ( ! self.isStyleTransferControl( control ) ) {
				return;
			}

			defaultValues[ controlName ] = control[ 'default' ];
		} );

		editModel.setSetting( defaultValues );

		elementor.channels.data.trigger( 'element:after:reset:style', editModel );

		self.allowRender = true;

		self.renderOnChange();
	},

	addElementFromPanel: function( options ) {
		options = options || {};

		var elementView = elementor.channels.panelElements.request( 'element:selected' );

		var itemData = {
			elType: elementView.model.get( 'elType' )
		};

		if ( 'widget' === itemData.elType ) {
			itemData.widgetType = elementView.model.get( 'widgetType' );
		} else if ( 'section' === itemData.elType ) {
			itemData.isInner = true;
		} else {
			return;
		}

		var customData = elementView.model.get( 'custom' );

		if ( customData ) {
			jQuery.extend( itemData, customData );
		}

		options.trigger = {
			beforeAdd: 'element:before:add',
			afterAdd: 'element:after:add'
		};

		options.onAfterAdd = function( newModel, newView ) {
			if ( 'section' === newView.getElementType() && newView.isInner() ) {
				newView.addChildElement();
			}
		};

		this.addChildElement( itemData, options );
	},

	addControlValidator: function( controlName, validationCallback ) {
		validationCallback = validationCallback.bind( this );

		var validator = new Validator( { customValidationMethod: validationCallback } ),
			validators = this.getEditModel().get( 'settings' ).validators;

		if ( ! validators[ controlName ] ) {
			validators[ controlName ] = [];
		}

		validators[ controlName ].push( validator );
	},

	addRenderAttribute: function( element, key, value, overwrite ) {
		var self = this;

		if ( 'object' === typeof element ) {
			jQuery.each( element, function( elementKey ) {
				self.addRenderAttribute( elementKey, this, null, overwrite );
			} );

			return self;
		}

		if ( 'object' === typeof key ) {
			jQuery.each( key, function( attributeKey ) {
				self.addRenderAttribute( element, attributeKey, this, overwrite );
			} );

			return self;
		}

		if ( ! self.renderAttributes[ element ] ) {
			self.renderAttributes[ element ] = {};
		}

		if ( ! self.renderAttributes[ element ][ key ] ) {
			self.renderAttributes[ element ][ key ] = [];
		}

		if ( ! Array.isArray( value ) ) {
			value = [ value ];
		}

		if ( overwrite ) {
			self.renderAttributes[ element ][ key ] = value;
		} else {
			self.renderAttributes[ element ][ key ] = self.renderAttributes[ element ][ key ].concat( value );
		}
	},

	getRenderAttributeString: function( element ) {
		if ( ! this.renderAttributes[ element ] ) {
			return '';
		}

		var renderAttributes = this.renderAttributes[ element ],
			attributes = [];

		jQuery.each( renderAttributes, function( attributeKey ) {
			attributes.push( attributeKey + '="' + _.escape( this.join( ' ' ) ) + '"' );
		} );

		return attributes.join( ' ' );
	},

	isInner: function() {
		return !! this.model.get( 'isInner' );
	},

	initControlsCSSParser: function() {
		this.controlsCSSParser = new ControlsCSSParser( {
			id: this.model.cid,
			settingsModel: this.getEditModel().get( 'settings' ),
			dynamicParsing: this.getDynamicParsingSettings()
		} );
	},

	enqueueFonts: function() {
		var editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

		_.each( settings.getFontControls(), function( control ) {
			var fontFamilyName = editModel.getSetting( control.name );

			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		} );
	},

	renderStyles: function( settings ) {
		if ( ! settings ) {
			settings = this.getEditModel().get( 'settings' );
		}

		this.controlsCSSParser.stylesheet.empty();

		this.controlsCSSParser.addStyleRules( settings.getStyleControls(), settings.attributes, this.getEditModel().get( 'settings' ).controls, [ /{{ID}}/g, /{{WRAPPER}}/g ], [ this.getID(), '#elementor .' + this.getElementUniqueID() ] );

		this.controlsCSSParser.addStyleToDocument();

		var extraCSS = elementor.hooks.applyFilters( 'editor/style/styleText', '', this );

		if ( extraCSS ) {
			this.controlsCSSParser.elements.$stylesheetElement.append( extraCSS );
		}
	},

	renderCustomClasses: function() {
		var self = this;

		var settings = self.getEditModel().get( 'settings' ),
			classControls = settings.getClassControls();

		// Remove all previous classes
		_.each( classControls, function( control ) {
			var previousClassValue = settings.previous( control.name );

			if ( control.classes_dictionary ) {
				if ( undefined !== control.classes_dictionary[ previousClassValue ] ) {
					previousClassValue = control.classes_dictionary[ previousClassValue ];
				}
			}

			self.$el.removeClass( control.prefix_class + previousClassValue );
		} );

		// Add new classes
		_.each( classControls, function( control ) {
			var value = settings.attributes[ control.name ],
				classValue = value;

			if ( control.classes_dictionary ) {
				if ( undefined !== control.classes_dictionary[ value ] ) {
					classValue = control.classes_dictionary[ value ];
				}
			}

			var isVisible = elementor.helpers.isActiveControl( control, settings.attributes );

			if ( isVisible && ( classValue || 0 === classValue ) ) {
				self.$el.addClass( control.prefix_class + classValue );
			}
		} );

		self.$el.addClass( _.result( self, 'className' ) );
	},

	renderCustomElementID: function() {
		var customElementID = this.getEditModel().get( 'settings' ).get( '_element_id' );

		this.$el.attr( 'id', customElementID );
	},

	renderUI: function() {
		this.renderStyles();
		this.renderCustomClasses();
		this.renderCustomElementID();
		this.enqueueFonts();
	},

	runReadyTrigger: function() {
		var self = this;

		_.defer( function() {
			elementorFrontend.elementsHandler.runReadyTrigger( self.$el );

			if ( ! elementorFrontend.isEditMode() ) {
				return;
			}

			// In edit mode - handle an external elements which loaded by another elements like shortcode etc.
			self.$el.find( '.elementor-element:not(.elementor-element-edit-mode)' ).each( function() {
				elementorFrontend.elementsHandler.runReadyTrigger( jQuery( this ) );
			} );
		} );
	},

	getID: function() {
		return this.model.get( 'id' );
	},

	getElementUniqueID: function() {
		return 'elementor-element-' + this.getID();
	},

	renderOnChange: function( settings ) {
		if ( ! this.allowRender ) {
			return;
		}

		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var hasChanged = settings.hasChanged(),
				isContentChanged = ! hasChanged,
				isRenderRequired = ! hasChanged;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				var control = settings.getControl( settingKey );

				if ( '_column_size' === settingKey ) {
					isRenderRequired = true;
					return;
				}

				if ( ! control ) {
					isRenderRequired = true;
					isContentChanged = true;
					return;
				}

				if ( 'none' !== control.render_type ) {
					isRenderRequired = true;
				}

				if ( -1 !== [ 'none', 'ui' ].indexOf( control.render_type ) ) {
					return;
				}

				if ( 'template' === control.render_type || ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) && '_element_id' !== settingKey ) {
					isContentChanged = true;
				}
			} );

			if ( ! isRenderRequired ) {
				return;
			}

			if ( ! isContentChanged ) {
				this.renderUI();
				return;
			}
		}

		// Re-render the template
		var templateType = this.getTemplateType(),
			editModel = this.getEditModel();

		if ( 'js' === templateType ) {
			this.getEditModel().setHtmlCache();
			this.render();
			editModel.renderOnLeave = true;
		} else {
			editModel.renderRemoteServer();
		}
	},

	getDynamicParsingSettings: function() {
		var self = this;

		return {
			onServerRequestStart: function() {
				self.$el.addClass( 'elementor-loading' );
			},
			onServerRequestEnd: function() {
				self.render();

				self.$el.removeClass( 'elementor-loading' );
			}
		};
	},

	serializeData: function() {
		var data = BaseContainer.prototype.serializeData.apply( this, arguments );

		data.settings = this.getEditModel().get( 'settings' ).parseDynamicSettings( data.settings, this.getDynamicParsingSettings() );

		return data;
	},

	save: function() {
		var model = this.model;

		elementor.templates.startModal( {
			onReady: function() {
				elementor.templates.getLayout().showSaveTemplateView( model );
			}
		} );
	},

	removeElement: function() {
		elementor.channels.data.trigger( 'element:before:remove', this.model );

		var parent = this._parent;

		parent.isManualRemoving = true;

		this.model.destroy();

		parent.isManualRemoving = false;

		elementor.channels.data.trigger( 'element:after:remove', this.model );
	},

	onBeforeRender: function() {
		this.renderAttributes = {};
	},

	onRender: function() {
		var self = this;

		self.renderUI();

		self.runReadyTrigger();
	},

	onCollectionChanged: function() {
		elementor.saver.setFlagEditorChange( true );
	},

	onEditSettingsChanged: function( changedModel ) {
		elementor.channels.editor
			.trigger( 'change:editSettings', changedModel, this );
	},

	onSettingsChanged: function( changedModel ) {
		elementor.saver.setFlagEditorChange( true );

		this.renderOnChange( changedModel );
	},

	onEditButtonClick: function() {
		this.model.trigger( 'request:edit' );
	},

	onEditRequest: function() {
		elementor.helpers.scrollToView( this.$el, 200 );

		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' !== activeMode ) {
			return;
		}

		elementor.getPanelView().openEditor( this.getEditModel(), this );
	},

	onDestroy: function() {
		this.controlsCSSParser.removeStyleFromDocument();

		elementor.channels.data.trigger( 'element:destroy', this.model );
	}
} );

module.exports = BaseElementView;
