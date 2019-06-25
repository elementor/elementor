import environment from '../../../../../../core/common/assets/js/utils/environment';

var ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' ),
	Validator = require( 'elementor-validator/base' ),
	BaseContainer = require( 'elementor-views/base-container' ),
	BaseElementView;

BaseElementView = BaseContainer.extend( {
	tagName: 'div',

	controlsCSSParser: null,

	allowRender: true,

	toggleEditTools: false,

	renderAttributes: {},

	className() {
		let classes = 'elementor-element elementor-element-edit-mode ' + this.getElementUniqueID();

		if ( this.toggleEditTools ) {
			classes += ' elementor-element--toggle-edit-tools';
		}

		return classes;
	},

	attributes() {
		return {
			'data-id': this.getID(),
			'data-element_type': this.model.get( 'elType' ),
		};
	},

	ui() {
		return {
			tools: '> .elementor-element-overlay > .elementor-editor-element-settings',
			editButton: '> .elementor-element-overlay .elementor-editor-element-edit',
			duplicateButton: '> .elementor-element-overlay .elementor-editor-element-duplicate',
			addButton: '> .elementor-element-overlay .elementor-editor-element-add',
			removeButton: '> .elementor-element-overlay .elementor-editor-element-remove',
		};
	},

	behaviors() {
		const groups = elementor.hooks.applyFilters( 'elements/' + this.options.model.get( 'elType' ) + '/contextMenuGroups', this.getContextMenuGroups(), this );

		const behaviors = {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: groups,
			},
		};

		return elementor.hooks.applyFilters( 'elements/base/behaviors', behaviors, this );
	},

	getBehavior( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	events() {
		return {
			mousedown: 'onMouseDown',
			'click @ui.editButton': 'onEditButtonClick',
			'click @ui.duplicateButton': 'onDuplicateButtonClick',
			'click @ui.addButton': 'onAddButtonClick',
			'click @ui.removeButton': 'onRemoveButtonClick',
		};
	},

	getElementType() {
		return this.model.get( 'elType' );
	},

	getIDInt() {
		return parseInt( this.getID(), 16 );
	},

	getChildType() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	getChildView( model ) {
		let ChildView;
		const elType = model.get( 'elType' );

		if ( 'section' === elType ) {
			ChildView = require( 'elementor-elements/views/section' );
		} else if ( 'column' === elType ) {
			ChildView = require( 'elementor-elements/views/column' );
		} else {
			ChildView = elementor.modules.elements.views.Widget;
		}

		return elementor.hooks.applyFilters( 'element/view', ChildView, model, this );
	},

	getTemplateType() {
		return 'js';
	},

	getEditModel() {
		return this.model;
	},

	getContextMenuGroups() {
		const controlSign = environment.mac ? '⌘' : '^';

		return [
			{
				name: 'general',
				actions: [
					{
						name: 'edit',
						icon: 'eicon-edit',
						title: elementor.translate( 'edit_element', [ this.options.model.getTitle() ] ),
						callback: this.options.model.trigger.bind( this.options.model, 'request:edit' ),
					}, {
						name: 'duplicate',
						icon: 'eicon-clone',
						title: elementor.translate( 'duplicate' ),
						shortcut: controlSign + '+D',
						callback: this.duplicate.bind( this ),
					},
				],
			}, {
				name: 'transfer',
				actions: [
					{
						name: 'copy',
						title: elementor.translate( 'copy' ),
						shortcut: controlSign + '+C',
						callback: this.copy.bind( this ),
					}, {
						name: 'paste',
						title: elementor.translate( 'paste' ),
						shortcut: controlSign + '+V',
						callback: this.paste.bind( this ),
						isEnabled: this.isPasteEnabled.bind( this ),
					}, {
						name: 'pasteStyle',
						title: elementor.translate( 'paste_style' ),
						shortcut: controlSign + '+⇧+V',
						callback: this.pasteStyle.bind( this ),
						isEnabled: () => {
							return !! elementorCommon.storage.get( 'transfer' );
						},
					}, {
						name: 'resetStyle',
						title: elementor.translate( 'reset_style' ),
						callback: this.resetStyle.bind( this ),
					},
				],
			}, {
				name: 'delete',
				actions: [
					{
						name: 'delete',
						icon: 'eicon-trash',
						title: elementor.translate( 'delete' ),
						shortcut: '⌦',
						callback: this.removeElement.bind( this ),
					},
				],
			},
		];
	},

	getEditButtons: function() {
		return {};
	},

	initialize() {
		BaseContainer.prototype.initialize.apply( this, arguments );

		if ( this.collection ) {
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		const editModel = this.getEditModel();

		this.listenTo( editModel.get( 'settings' ), 'change', this.onSettingsChanged )
			.listenTo( editModel.get( 'editSettings' ), 'change', this.onEditSettingsChanged )
			.listenTo( this.model, 'request:edit', this.onEditRequest )
			.listenTo( this.model, 'request:toggleVisibility', this.toggleVisibility );

		this.initControlsCSSParser();
	},

	getHandlesOverlay: function() {
		const $handlesOverlay = jQuery( '<div>', { class: 'elementor-element-overlay' } ),
			$overlayList = jQuery( '<ul>', { class: `elementor-editor-element-settings elementor-editor-${ this.getElementType() }-settings` } );

		jQuery.each( this.getEditButtons(), ( toolName, tool ) => {
			const $item = jQuery( '<li>', { class: `elementor-editor-element-setting elementor-editor-element-${ toolName }`, title: tool.title } ),
				$icon = jQuery( '<i>', { class: `eicon-${ tool.icon }`, 'aria-hidden': true } ),
				$a11y = jQuery( '<span>', { class: 'elementor-screen-only' } );

			$a11y.text( tool.title );

			$item.append( $icon, $a11y );

			$overlayList.append( $item );
		} );

		$handlesOverlay.append( $overlayList );

		return $handlesOverlay;
	},

	attachElContent: function( html ) {
		this.$el.empty().append( this.getHandlesOverlay(), html );
	},

	startTransport( type ) {
		elementorCommon.storage.set( 'transfer', {
			type: type,
			elementsType: this.getElementType(),
			elements: [ this.model.toJSON( { copyHtmlCache: true } ) ],
		} );
	},

	copy() {
		this.startTransport( 'copy' );
	},

	cut() {
		this.startTransport( 'cut' );
	},

	paste() {
		this.trigger( 'request:paste' );
	},

	isPasteEnabled() {
		const transferData = elementorCommon.storage.get( 'transfer' );

		if ( ! transferData || this.isCollectionFilled() ) {
			return false;
		}

		return this.getElementType() === transferData.elementsType;
	},

	isStyleTransferControl( control ) {
		if ( undefined !== control.style_transfer ) {
			return control.style_transfer;
		}

		return 'content' !== control.tab || control.selectors || control.prefix_class;
	},

	duplicate() {
		const oldTransport = elementorCommon.storage.get( 'transfer' );

		this.copy();

		this.paste();

		elementorCommon.storage.set( 'transfer', oldTransport );
	},

	pasteStyle() {
		var self = this,
			transferData = elementorCommon.storage.get( 'transfer' ),
			sourceElement = transferData.elements[ 0 ],
			sourceSettings = sourceElement.settings,
			editModel = self.getEditModel(),
			settings = editModel.get( 'settings' ),
			settingsAttributes = settings.attributes,
			controls = settings.controls,
			diffSettings = {};

		jQuery.each( controls, ( controlName, control ) => {
			if ( ! self.isStyleTransferControl( control ) ) {
				return;
			}

			const sourceValue = sourceSettings[ controlName ],
				targetValue = settingsAttributes[ controlName ];

			if ( undefined === sourceValue || undefined === targetValue ) {
				return;
			}

			if ( 'object' === typeof sourceValue ^ 'object' === typeof targetValue ) {
				return;
			}

			if ( 'object' === typeof sourceValue ) {
				let isEqual = true;

				jQuery.each( sourceValue, function( propertyKey ) {
					if ( sourceValue[ propertyKey ] !== targetValue[ propertyKey ] ) {
						return isEqual = false;
					}
				} );

				if ( isEqual ) {
					return;
				}
			}
			if ( sourceValue === targetValue ) {
				return;
			}

			const ControlView = elementor.getControlView( control.type );

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

	resetStyle() {
		const self = this,
			editModel = self.getEditModel(),
			controls = editModel.get( 'settings' ).controls,
			defaultValues = {};

		self.allowRender = false;

		elementor.channels.data.trigger( 'element:before:reset:style', editModel );

		jQuery.each( controls, ( controlName, control ) => {
			if ( ! self.isStyleTransferControl( control ) ) {
				return;
			}

			defaultValues[ controlName ] = control.default;
		} );

		editModel.setSetting( defaultValues );

		elementor.channels.data.trigger( 'element:after:reset:style', editModel );

		self.allowRender = true;

		self.renderOnChange();
	},

	toggleVisibility() {
		this.model.set( 'hidden', ! this.model.get( 'hidden' ) );

		this.toggleVisibilityClass();
	},

	toggleVisibilityClass() {
		this.$el.toggleClass( 'elementor-edit-hidden', ! ! this.model.get( 'hidden' ) );
	},

	addElementFromPanel( options ) {
		options = options || {};

		const elementView = elementor.channels.panelElements.request( 'element:selected' );

		const itemData = {
			elType: elementView.model.get( 'elType' ),
		};

		if ( elementor.helpers.maybeDisableWidget() ) {
			return;
		}

		if ( 'widget' === itemData.elType ) {
			itemData.widgetType = elementView.model.get( 'widgetType' );
		} else if ( 'section' === itemData.elType ) {
			itemData.isInner = true;
		} else {
			return;
		}

		const customData = elementView.model.get( 'custom' );

		if ( customData ) {
			jQuery.extend( itemData, customData );
		}

		options.trigger = {
			beforeAdd: 'element:before:add',
			afterAdd: 'element:after:add',
		};

		options.onAfterAdd = function( newModel, newView ) {
			if ( 'section' === newView.getElementType() && newView.isInner() ) {
				newView.addChildElement();
			}
		};

		this.addChildElement( itemData, options );
	},

	addControlValidator( controlName, validationCallback ) {
		validationCallback = validationCallback.bind( this );

		const validator = new Validator( { customValidationMethod: validationCallback } ),
			validators = this.getEditModel().get( 'settings' ).validators;

		if ( ! validators[ controlName ] ) {
			validators[ controlName ] = [];
		}

		validators[ controlName ].push( validator );
	},

	addRenderAttribute( element, key, value, overwrite ) {
		const self = this;

		if ( 'object' === typeof element ) {
			jQuery.each( element, ( elementKey, elementValue ) => {
				self.addRenderAttribute( elementKey, elementValue, null, overwrite );
			} );

			return self;
		}

		if ( 'object' === typeof key ) {
			jQuery.each( key, ( attributeKey, attributeValue ) => {
				self.addRenderAttribute( element, attributeKey, attributeValue, overwrite );
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

	getRenderAttributeString( element ) {
		if ( ! this.renderAttributes[ element ] ) {
			return '';
		}

		const renderAttributes = this.renderAttributes[ element ],
			attributes = [];

		jQuery.each( renderAttributes, ( attributeKey, attributeValue ) => {
			attributes.push( attributeKey + '="' + _.escape( attributeValue.join( ' ' ) ) + '"' );
		} );

		return attributes.join( ' ' );
	},

	isInner: function() {
		return !! this.model.get( 'isInner' );
	},

	initControlsCSSParser() {
		this.controlsCSSParser = new ControlsCSSParser( {
			id: this.model.cid,
			settingsModel: this.getEditModel().get( 'settings' ),
			dynamicParsing: this.getDynamicParsingSettings(),
		} );
	},

	enqueueFonts() {
		const editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

		jQuery.each( settings.getFontControls(), ( index, control ) => {
			const fontFamilyName = editModel.getSetting( control.name );

			if ( ! fontFamilyName ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		} );

		// Enqueue Icon Fonts
		jQuery.each( settings.getIconsControls(), ( index, control ) => {
			const iconType = editModel.getSetting( control.name );

			if ( ! iconType || ! iconType.library ) {
				return;
			}

			elementor.helpers.enqueueIconFonts( iconType.library );
		} );
	},

	renderStyles( settings ) {
		if ( ! settings ) {
			settings = this.getEditModel().get( 'settings' );
		}

		this.controlsCSSParser.stylesheet.empty();

		this.controlsCSSParser.addStyleRules( settings.getStyleControls(), settings.attributes, this.getEditModel().get( 'settings' ).controls, [ /{{ID}}/g, /{{WRAPPER}}/g ], [ this.getID(), '#elementor .' + this.getElementUniqueID() ] );

		this.controlsCSSParser.addStyleToDocument();

		const extraCSS = elementor.hooks.applyFilters( 'editor/style/styleText', '', this );

		if ( extraCSS ) {
			this.controlsCSSParser.elements.$stylesheetElement.append( extraCSS );
		}
	},

	renderCustomClasses() {
		const self = this;

		const settings = self.getEditModel().get( 'settings' ),
			classControls = settings.getClassControls();

		// Remove all previous classes
		_.each( classControls, ( control ) => {
			let previousClassValue = settings.previous( control.name );

			if ( control.classes_dictionary ) {
				if ( undefined !== control.classes_dictionary[ previousClassValue ] ) {
					previousClassValue = control.classes_dictionary[ previousClassValue ];
				}
			}

			self.$el.removeClass( control.prefix_class + previousClassValue );
		} );

		// Add new classes
		_.each( classControls, ( control ) => {
			const value = settings.attributes[ control.name ];
			let classValue = value;

			if ( control.classes_dictionary ) {
				if ( undefined !== control.classes_dictionary[ value ] ) {
					classValue = control.classes_dictionary[ value ];
				}
			}

			const isVisible = elementor.helpers.isActiveControl( control, settings.attributes );

			if ( isVisible && ( classValue || 0 === classValue ) ) {
				self.$el.addClass( control.prefix_class + classValue );
			}
		} );

		self.$el.addClass( _.result( self, 'className' ) );

		self.toggleVisibilityClass();
	},

	renderCustomElementID() {
		const customElementID = this.getEditModel().get( 'settings' ).get( '_element_id' );

		this.$el.attr( 'id', customElementID );
	},

	renderUI: function() {
		this.renderStyles();
		this.renderCustomClasses();
		this.renderCustomElementID();
		this.enqueueFonts();
	},

	runReadyTrigger: function() {
		const self = this;

		_.defer( function() {
			elementorFrontend.elementsHandler.runReadyTrigger( self.el );

			if ( ! elementorFrontend.isEditMode() ) {
				return;
			}

			// In edit mode - handle an external elements that loaded by another elements like shortcode etc.
			self.$el.find( '.elementor-element.elementor-' + self.model.get( 'elType' ) + ':not(.elementor-element-edit-mode)' ).each( function() {
				elementorFrontend.elementsHandler.runReadyTrigger( this );
			} );
		} );
	},

	getID() {
		return this.model.get( 'id' );
	},

	getElementUniqueID() {
		return 'elementor-element-' + this.getID();
	},

	renderOnChange( settings ) {
		if ( ! this.allowRender ) {
			return;
		}

		// Make sure is correct model
		if ( settings instanceof elementorModules.editor.elements.models.BaseSettings ) {
			const hasChanged = settings.hasChanged();
			let isContentChanged = ! hasChanged,
				isRenderRequired = ! hasChanged;

			_.each( settings.changedAttributes(), ( settingValue, settingKey ) => {
				const control = settings.getControl( settingKey );

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

				if ( 'template' === control.render_type || ( ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) && '_element_id' !== settingKey ) ) {
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
		const templateType = this.getTemplateType(),
			editModel = this.getEditModel();

		if ( 'js' === templateType ) {
			this.getEditModel().setHtmlCache();
			this.render();
			editModel.renderOnLeave = true;
		} else {
			editModel.renderRemoteServer();
		}
	},

	getDynamicParsingSettings() {
		const self = this;

		return {
			onServerRequestStart() {
				self.$el.addClass( 'elementor-loading' );
			},
			onServerRequestEnd() {
				self.render();

				self.$el.removeClass( 'elementor-loading' );
			},
		};
	},

	serializeData() {
		const data = BaseContainer.prototype.serializeData.apply( this, arguments );

		data.settings = this.getEditModel().get( 'settings' ).parseDynamicSettings( data.settings, this.getDynamicParsingSettings() );

		return data;
	},

	save() {
		const model = this.model;

		elementor.templates.startModal( {
			onReady: () => elementor.templates.getLayout().showSaveTemplateView( model ),
		} );
	},

	removeElement() {
		elementor.channels.data.trigger( 'element:before:remove', this.model );

		const parent = this._parent;

		parent.isManualRemoving = true;

		this.model.destroy();

		parent.isManualRemoving = false;

		elementor.channels.data.trigger( 'element:after:remove', this.model );
	},

	onBeforeRender() {
		this.renderAttributes = {};
	},

	onRender() {
		this.renderUI();

		this.runReadyTrigger();

		if ( this.toggleEditTools ) {
			const editButton = this.ui.editButton;

			this.ui.tools.hoverIntent( function() {
				editButton.addClass( 'elementor-active' );
			}, function() {
				editButton.removeClass( 'elementor-active' );
			}, { timeout: 500 } );
		}
	},

	onCollectionChanged() {
		elementor.saver.setFlagEditorChange( true );
	},

	onEditSettingsChanged( changedModel ) {
		elementor.channels.editor.trigger( 'change:editSettings', changedModel, this );
	},

	onSettingsChanged( changedModel ) {
		elementor.saver.setFlagEditorChange( true );

		this.renderOnChange( changedModel );
	},

	onEditButtonClick() {
		this.model.trigger( 'request:edit' );
	},

	onEditRequest( options = {} ) {
		if ( 'edit' !== elementor.channels.dataEditMode.request( 'activeMode' ) ) {
			return;
		}

		const model = this.getEditModel(),
			panel = elementor.getPanelView();

		if ( 'editor' === panel.getCurrentPageName() && panel.getCurrentPageView().model === model ) {
			return;
		}

		if ( options.scrollIntoView ) {
			elementor.helpers.scrollToView( this.$el, 200 );
		}

		panel.openEditor( model, this );
	},

	onDuplicateButtonClick( event ) {
		event.stopPropagation();

		this.duplicate();
	},

	onRemoveButtonClick( event ) {
		event.stopPropagation();

		this.removeElement();
	},

	/* jQuery ui sortable preventing any `mousedown` event above any element, and as a result is preventing the `blur`
	 * event on the currently active element. Therefor, we need to blur the active element manually.
	 */
	onMouseDown( event ) {
		if ( jQuery( event.target ).closest( '.elementor-inline-editing' ).length ) {
			return;
		}

		elementorFrontend.elements.window.document.activeElement.blur();
	},

	onDestroy() {
		this.controlsCSSParser.removeStyleFromDocument();

		this.getEditModel().get( 'settings' ).validators = {};

		elementor.channels.data.trigger( 'element:destroy', this.model );
	},
} );

module.exports = BaseElementView;
