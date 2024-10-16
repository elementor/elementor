import environment from 'elementor-common/utils/environment';
import ElementTypeNotFound from 'elementor-editor/errors/element-type-not-found';

var ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' ),
	Validator = require( 'elementor-validator/base' ),
	BaseContainer = require( 'elementor-views/base-container' ),
	BaseElementView;

/**
 * @typedef {{}} DataBinding
 * @property {DOMStringMap} dataset The dataset of the element.
 * @property {HTMLElement}  el      The element.
 */

/**
 * @name BaseElementView
 * @augments {BaseContainer}
 */
BaseElementView = BaseContainer.extend( {
	tagName: 'div',

	controlsCSSParser: null,

	allowRender: true,

	toggleEditTools: false,

	renderAttributes: {},

	isRendering: false,

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
			'data-model-cid': this.model.cid,
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
		const elementType = this.options.model.get( 'elType' );

		const groups = elementor.hooks.applyFilters( `elements/${ elementType }/contextMenuGroups`, this.getContextMenuGroups(), this );

		const behaviors = {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups,
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
		const elementType = model.get( 'widgetType' ) || model.get( 'elType' ),
			elementTypeClass = elementor.elementsManager.getElementTypeClass( elementType );

		if ( ! elementTypeClass ) {
			throw new ElementTypeNotFound( elementType );
		}

		return elementor.hooks.applyFilters( 'element/view', elementTypeClass.getView(), model, this );
	},

	getTemplateType() {
		return 'js';
	},

	getEditModel() {
		return this.model;
	},

	getContainer() {
		if ( ! this.container ) {
			const settingsModel = this.model.get( 'settings' );

			this.container = new elementorModules.editor.Container( {
				type: this.model.get( 'elType' ),
				id: this.model.id,
				model: this.model,
				settings: settingsModel,
				view: this,
				parent: this._parent ? this._parent.getContainer() : false,
				label: elementor.helpers.getModelLabel( this.model ),
				controls: settingsModel.options.controls,
			} );
		}

		return this.container;
	},

	getContextMenuGroups() {
		const controlSign = environment.mac ? '&#8984;' : '^';

		let groups = [
			{
				name: 'general',
				actions: [
					{
						name: 'edit',
						icon: 'eicon-edit',
						/* Translators: %s: Element Name. */
						title: () => sprintf( __( 'Edit %s', 'elementor' ), elementor.selection.isMultiple() ? '' : this.options.model.getTitle() ),
						isEnabled: () => ! elementor.selection.isMultiple(),
						callback: () => $e.run( 'document/elements/select', { container: this.getContainer() } ),
					}, {
						name: 'duplicate',
						icon: 'eicon-clone',
						title: __( 'Duplicate', 'elementor' ),
						shortcut: controlSign + '+D',
						isEnabled: () => elementor.selection.isSameType() && ! this.getContainer().isLocked(),
						callback: () => $e.run( 'document/elements/duplicate', { containers: elementor.selection.getElements( this.getContainer() ) } ),
					},
				],
			}, {
				name: 'clipboard',
				actions: [
					{
						name: 'copy',
						title: __( 'Copy', 'elementor' ),
						shortcut: controlSign + '+C',
						isEnabled: () => elementor.selection.isSameType() && ! this.getContainer().isLocked(),
						callback: () => $e.run( 'document/elements/copy', {
							containers: elementor.selection.getElements( this.getContainer() ),
						} ),
					}, {
						name: 'paste',
						title: __( 'Paste', 'elementor' ),
						shortcut: controlSign + '+V',
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( this.getContainer() ) &&
							elementor.selection.isSameType(),
						callback: () => $e.run( 'document/ui/paste', {
							container: this.getContainer(),
						} ),
					}, {
						name: 'pasteStyle',
						title: __( 'Paste style', 'elementor' ),
						shortcut: controlSign + '+⇧+V',
						isEnabled: () => !! elementorCommon.storage.get( 'clipboard' ),
						callback: () => $e.run( 'document/elements/paste-style', { containers: elementor.selection.getElements( this.getContainer() ) } ),
					}, {
						name: 'pasteArea',
						icon: 'eicon-import-export',
						title: __( 'Paste from other site', 'elementor' ),
						callback: () => $e.run( 'document/elements/paste-area', {
							container: this.getContainer(),
						} ),
					}, {
						name: 'resetStyle',
						title: __( 'Reset style', 'elementor' ),
						callback: () => $e.run( 'document/elements/reset-style', {
							containers: elementor.selection.getElements( this.getContainer() ),
						} ),
					},
				],
			},
		];

		let customGroups = [];

		/**
		 * Filter Additional Context Menu Groups.
		 *
		 * This filter allows adding new context menu groups to elements.
		 *
		 * @param array  customGroups - An array of group objects.
		 * @param string elementType - The current element type.
		 */
		customGroups = elementor.hooks.applyFilters( 'elements/context-menu/groups', customGroups, this.options.model.get( 'elType' ) );

		if ( customGroups.length ) {
			groups = [ ...groups, ...customGroups ];
		}

		groups.push( {
			name: 'delete',
			actions: [
				{
					name: 'delete',
					icon: 'eicon-trash',
					title: () => {
						if ( elementor.selection.isMultiple() ) {
							// Translators: %d: Elements count.
							return sprintf( __( 'Delete %d items', 'elementor' ), elementor.selection.getElements().length );
						}
						return __( 'Delete', 'elementor' );
					},
					shortcut: '⌦',
					callback: () => $e.run( 'document/elements/delete', { containers: elementor.selection.getElements( this.getContainer() ) } ),
					isEnabled: () => ! this.getContainer().isLocked(),
				},
			],
		} );

		return groups;
	},

	getEditButtons() {
		return {};
	},

	initialize() {
		BaseContainer.prototype.initialize.apply( this, arguments );

		const editModel = this.getEditModel();

		if ( this.collection && this.onCollectionChanged ) {
			elementorDevTools.deprecation.deprecated( 'onCollectionChanged', '2.8.0', '$e.hooks' );
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		if ( this.onSettingsChanged ) {
			elementorDevTools.deprecation.deprecated( 'onSettingsChanged', '2.8.0', '$e.hooks' );
			this.listenTo( editModel.get( 'settings' ), 'change', this.onSettingsChanged );
		}

		this.listenTo( editModel.get( 'editSettings' ), 'change', this.onEditSettingsChanged )
			.listenTo( this.model, 'request:edit', this.onEditRequest )
			.listenTo( this.model, 'request:toggleVisibility', this.toggleVisibility );

		this.initControlsCSSParser();

		if ( ! this.onDynamicServerRequestEnd ) {
			this.onDynamicServerRequestEnd = _.debounce( () => {
				this.render();

				this.$el.removeClass( 'elementor-loading' );
			}, 100 );
		}
	},

	getHandlesOverlay() {
		const elementType = this.getElementType(),
			$handlesOverlay = jQuery( '<div>', { class: 'elementor-element-overlay' } ),
			$overlayList = jQuery( '<ul>', { class: `elementor-editor-element-settings elementor-editor-${ elementType }-settings` } ),
			editButtonsEnabled = elementor.getPreferences( 'edit_buttons' ),
			elementData = elementor.getElementData( this.model );

		let editButtons = this.getEditButtons();

		// We should only allow external modification to edit buttons if the user enabled edit buttons.
		if ( editButtonsEnabled ) {
			/**
			 * Filter edit buttons.
			 *
			 * This filter allows adding edit buttons to all element types.
			 *
			 * @since 3.5.0
			 *
			 * @param array editButtons An array of buttons.
			 */
			editButtons = elementor.hooks.applyFilters( `elements/edit-buttons`, editButtons );

			/**
			 * Filter edit buttons.
			 *
			 * This filter allows adding edit buttons only to a specific element type.
			 *
			 * The dynamic portion of the hook name, `elementType`, refers to element type (widget, column, section).
			 *
			 * @since 3.5.0
			 *
			 * @param array editButtons An array of buttons.
			 */
			editButtons = elementor.hooks.applyFilters( `elements/edit-buttons/${ elementType }`, editButtons );
		}

		// Only sections always have the remove button, even if the Editing Handles preference is off.
		if ( 'section' === elementType || editButtonsEnabled ) {
			editButtons.remove = {
				/* Translators: %s: Element Name. */
				title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
				icon: 'close',
			};
		}

		jQuery.each( editButtons, ( toolName, tool ) => {
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

	attachElContent( html ) {
		this.$el.empty().append( this.getHandlesOverlay(), html );
	},

	isStyleTransferControl( control ) {
		if ( undefined !== control.style_transfer ) {
			return control.style_transfer;
		}

		return 'content' !== control.tab || control.selectors || control.prefix_class;
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

		const elementView = elementor.channels.panelElements.request( 'element:selected' ),
			model = {
				elType: elementView.model.get( 'elType' ),
			};

		if ( elementor.helpers.maybeDisableWidget() ) {
			return;
		}

		if ( 'widget' === model.elType ) {
			model.widgetType = elementView.model.get( 'widgetType' );
		} else if ( 'section' === model.elType ) {
			model.isInner = true;
		} else if ( 'container' !== model.elType ) {
			// Don't allow adding anything other than widget, inner-section or a container.
			return;
		}

		// Don't allow adding inner-sections inside inner-sections.
		if ( 'section' === model.elType && this.isInner() ) {
			return;
		}

		const customData = elementView.model.get( 'custom' );

		if ( customData ) {
			jQuery.extend( model, customData );
		}

		// Reset the selected element cache.
		elementor.channels.panelElements.reply( 'element:selected', null );

		return $e.run( 'document/elements/create', {
			container: this.getContainer(),
			model,
			options,
		} );
	},

	// TODO: Unused function.
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

	isInner() {
		return !! this.model.get( 'isInner' );
	},

	initControlsCSSParser() {
		this.controlsCSSParser = new ControlsCSSParser( {
			id: this.model.get( 'id' ),
			context: this,
			settingsModel: this.getEditModel().get( 'settings' ),
			dynamicParsing: this.getDynamicParsingSettings(),
		} );
	},

	enqueueFonts() {
		const editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

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

		this.controlsCSSParser.addStyleRules(
			settings.getStyleControls(),
			settings.attributes,
			this.getEditModel().get( 'settings' ).controls,
			[ /{{ID}}/g, /{{WRAPPER}}/g ],
			[ this.getID(), '.elementor-' + elementor.config.document.id + ' .elementor-element.' + this.getElementUniqueID() ] );

		this.controlsCSSParser.addStyleToDocument();
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

			const isVisible = elementor.helpers.isActiveControl( control, settings.attributes, settings.controls );

			if ( isVisible && ( classValue || 0 === classValue ) ) {
				self.$el.addClass( control.prefix_class + classValue );
			}
		} );

		self.$el.addClass( _.result( self, 'className' ) );

		self.toggleVisibilityClass();
	},

	renderCustomElementID() {
		const customElementID = this.getEditModel().get( 'settings' ).get( '_element_id' );

		if ( customElementID ) {
			this.$el.attr( 'id', customElementID );
		}
	},

	renderUI() {
		this.renderStyles();
		this.renderCustomClasses();
		this.renderCustomElementID();
		this.enqueueFonts();
	},

	runReadyTrigger() {
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

	renderHTML() {
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

	renderChanges( settings ) {
		// Make sure is correct model
		if ( settings instanceof elementorModules.editor.elements.models.BaseSettings ) {
			const hasChanged = settings.hasChanged();
			let isContentChanged = ! hasChanged,
				isRenderRequired = ! hasChanged;

			_.each( settings.changedAttributes(), ( settingValue, settingKey ) => {
				if ( '_column_size' === settingKey ) {
					isRenderRequired = true;
					return;
				}

				const control = settings.getControl( settingKey );
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

		this.renderHTML();
	},

	isAtomicDynamic( changedSettings, dataBinding, changedControl ) {
		return '__dynamic__' in changedSettings &&
			dataBinding.el.hasAttribute( 'data-binding-dynamic' ) &&
			elementorCommon.config.experimentalFeatures.e_nested_atomic_repeaters &&
			dataBinding.el.getAttribute( 'data-binding-setting' ) === changedControl;
	},

	async getDynamicValue( settings, changedControlKey, bindingSetting ) {
		const dynamicSettings = { active: true },
			valueToParse = this.getChangedData( settings, changedControlKey, bindingSetting );

		if ( ! valueToParse ) {
			return settings.attributes[ changedControlKey ];
		}

		return await this.getDataFromCacheOrBackend( valueToParse, dynamicSettings );
	},

	findUniqueKey( obj1, obj2 ) {
		if ( 'object' !== typeof obj1 || 'object' !== typeof obj2 ) {
			return false;
		}

		const keys1 = Object.keys( obj1 ),
			keys2 = Object.keys( obj2 );

		const allKeys = keys1.concat( keys2 );

		return allKeys.filter( ( item, index, arr ) => arr.indexOf( item ) === arr.lastIndexOf( item ) );
	},

	/**
	 * Function linkDataBindings().
	 *
	 * Link data to allow partial render, instead of full re-render
	 *
	 * How to use?
	 *  If the element which should be rendered for a setting key is known in advance, it's possible to add the following attributes to the element to avoid full re-render:
	 *  Example for repeater item:
	 * 'data-binding-type': 'repeater-item',               // Type of binding (to know how to behave).
	 * 'data-binding-setting': 'tab_title',                // Setting key that effect the binding.
	 * 'data-binding-index': tabCount,                     // Index is required for repeater items.
	 *
	 * Example for content:
	 * 'data-binding-type': 'content',                     // Type of binding.
	 * 'data-binding-setting': 'testimonial_content',      // Setting change to capture, the value will replace the link.
	 *
	 * By adding the following example attributes inside the widget the element innerHTML will be linked to the 'testimonial_content' setting value.
	 *
	 *
	 * Current Limitation:
	 * Not working with dynamics, will required full re-render.
	 * UPDATE: Support for dynamics has experimentally been added in v3.23
	 */
	linkDataBindings() {
		/**
		 * @type {Array.<DataBinding>}
		 */
		this.dataBindings = [];

		const id = this.$el.data( 'id' );

		if ( ! id ) {
			return;
		}

		const $dataBinding = this.$el.find( '[data-binding-type]' );

		if ( ! $dataBinding.length ) {
			return;
		}

		$dataBinding.each( ( index, current ) => {
			// To support nested data-binding bypass nested data-binding that are not part of the current.
			if ( jQuery( current ).closest( '.elementor-element' ).data( 'id' ) === id ) {
				if ( current.dataset.bindingType ) {
					this.dataBindings.push( {
						el: current,
						dataset: current.dataset,
					} );
				}
			}
		} );
	},

	/**
	 * Function renderDataBindings().
	 *
	 * Render linked data.
	 *
	 * @param {Object}              settings
	 * @param {Array.<DataBinding>} dataBindings
	 *
	 * @return {boolean} - false on fail.
	 */
	renderDataBindings( settings, dataBindings ) {
		if ( ! this.dataBindings?.length ) {
			return false;
		}

		let changed = false;

		const renderDataBinding = async ( dataBinding ) => {
			const { bindingSetting } = dataBinding.dataset,
				changedControl = this.getChangedDynamicControlKey( settings );
			let change = settings.changed[ bindingSetting ];

			if ( this.isAtomicDynamic( settings.changed, dataBinding, changedControl ) ) {
				const dynamicValue = await this.getDynamicValue( settings, changedControl, bindingSetting );

				if ( dynamicValue ) {
					change = dynamicValue;
				}
			}

			if ( change !== undefined ) {
				dataBinding.el.innerHTML = change;
				return true;
			}

			return false;
		};

		for ( const dataBinding of dataBindings ) {
			switch ( dataBinding.dataset.bindingType ) {
				case 'repeater-item': {
					const repeater = this.container.repeaters[ dataBinding.dataset.bindingRepeaterName ];

					if ( ! repeater ) {
						break;
					}

					const container = repeater.children.find( ( i ) => i.id === settings.attributes._id );

					if ( ( container?.parent?.children.indexOf( container ) + 1 ) === parseInt( dataBinding.dataset.bindingIndex ) ) {
						changed = renderDataBinding( dataBinding );
					} else if ( dataBindings.indexOf( dataBinding ) + 1 === this.getRepeaterItemActiveIndex() ) {
						changed = this.tryHandleDynamicCoverSettings( dataBinding, settings );
					}
				}
					break;

				case 'content': {
					changed = renderDataBinding( dataBinding );
				}
					break;
			}

			if ( changed ) {
				break;
			}
		}

		return changed;
	},

	/**
	 * Function renderOnChange().
	 *
	 * Render the changes in the settings according to the current situation.
	 *
	 * @param {Object} settings
	 */
	renderOnChange( settings ) {
		if ( ! this.allowRender ) {
			return;
		}

		if ( this.isRendering ) {
			this.isRendering = false;

			return;
		}

		const renderResult = this.renderDataBindings( settings, this.dataBindings );

		if ( renderResult instanceof Promise ) {
			renderResult.then( ( result ) => {
				if ( ! result ) {
					this.renderChanges( settings );
				}
			} );
		}

		if ( ! renderResult ) {
			this.renderChanges( settings );
		}
	},

	getDynamicParsingSettings() {
		const self = this;

		return {
			onServerRequestStart() {
				self.$el.addClass( 'elementor-loading' );
			},
			onServerRequestEnd: self.onDynamicServerRequestEnd,
		};
	},

	serializeData() {
		const data = BaseContainer.prototype.serializeData.apply( this, arguments );

		data.settings = this.getEditModel().get( 'settings' ).parseDynamicSettings( data.settings, this.getDynamicParsingSettings() );

		return data;
	},

	save() {
		$e.route( 'library/save-template', {
			model: this.model,
		} );
	},

	onBeforeRender() {
		this.renderAttributes = {};
	},

	render() {
		this.getContainer();

		BaseContainer.prototype.render.apply( this, arguments );
	},

	onRender() {
		this.linkDataBindings();

		this.renderUI();

		this.runReadyTrigger();

		if ( this.toggleEditTools ) {
			const editButton = this.ui.editButton;

			// Since this.ui.tools does not exist while testing.
			if ( this.ui.tools ) {
				this.ui.tools.hoverIntent( function() {
					editButton.addClass( 'elementor-active' );
				}, function() {
					editButton.removeClass( 'elementor-active' );
				}, { timeout: 500 } );
			}
		}

		// Defer to wait for all of the children to render.
		setTimeout( () => {
			this.initDraggable();
			this.dispatchElementLifeCycleEvent( 'rendered' );
			elementorFrontend.elements.$window.on( 'elementor/elements/link-data-bindings', this.linkDataBindings.bind( this ) );
		} );
	},

	dispatchElementLifeCycleEvent( eventType ) {
		let event;

		// Event name set like this for maintainability.
		switch ( eventType ) {
			case 'rendered':
				event = 'elementor/editor/element-rendered';
				break;
			case 'destroyed':
				event = 'elementor/editor/element-destroyed';
				break;
		}

		const renderedEvent = new CustomEvent( event, { detail: { elementView: this } } );
		elementor.$preview[ 0 ].contentWindow.dispatchEvent( renderedEvent );
	},

	onEditSettingsChanged( changedModel ) {
		elementor.channels.editor.trigger( 'change:editSettings', changedModel, this );
	},

	onEditButtonClick( event ) {
		this.model.trigger( 'request:edit', { append: event.ctrlKey || event.metaKey } );
	},

	onEditRequest( options = {} ) {
		if ( ! this.container.isEditable() ) {
			return;
		}

		const model = this.getEditModel(),
			panel = elementor.getPanelView();

		if ( $e.routes.isPartOf( 'panel/editor' ) && panel.getCurrentPageView().model === model ) {
			return;
		}

		if ( options.scrollIntoView ) {
			elementor.helpers.scrollToView( this.$el, 200 );
		}

		$e.run( 'document/elements/toggle-selection', {
			container: this.getContainer(),
			append: options.append,
		} );
	},

	/**
	 * Select current element.
	 */
	select() {
		this.$el.addClass( 'elementor-element-editable' );
	},

	/**
	 * Deselect current element.
	 */
	deselect() {
		this.$el.removeClass( 'elementor-element-editable' );
	},

	onDuplicateButtonClick( event ) {
		event.stopPropagation();

		$e.run( 'document/elements/duplicate', { container: this.getContainer() } );
	},

	onRemoveButtonClick( event ) {
		event.stopPropagation();

		$e.run( 'document/elements/delete', { container: this.getContainer() } );
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
		if ( this.dataBindings ) {
			delete this.dataBindings;
		}

		this.controlsCSSParser.removeStyleFromDocument();

		this.getEditModel().get( 'settings' ).validators = {};

		elementor.channels.data.trigger( 'element:destroy', this.model );

		// Defer so the event is fired after the element is removed from the DOM.
		setTimeout( () => this.dispatchElementLifeCycleEvent( 'destroyed' ) );
	},

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * On `$el` drag start event.
	 * Used inside `Draggable` and can be overridden by the extending views.
	 */
	onDragStart() {
		// TODO: Override if needed.
	},

	/**
	 * On `$el` drag end event.
	 * Used inside `Draggable` and can be overridden by the extending views.
	 */
	onDragEnd() {
		// TODO: Override if needed.
	},

	/**
	 * Create a drag helper element.
	 * Copied from `behaviors/sortable.js` with some refactor.
	 *
	 * @return {HTMLDivElement} helper
	 */
	getDraggableHelper() {
		const model = this.getEditModel();

		const helper = document.createElement( 'div' );
		helper.classList.add( 'elementor-sortable-helper', `elementor-sortable-helper-${ model.get( 'elType' ) }` );

		helper.innerHTML = `
			<div class="icon">
				<i class="${ model.getIcon() }"></i>
			</div>
			<div class="title-wrapper">
				<div class="title">${ model.getTitle() }</div>
			</div>
		`;

		return helper;
	},

	/**
	 * Initialize the Droppable instance.
	 */
	initDraggable() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		// Init the draggable only for Containers and their children.
		if ( ! this.$el.hasClass( '.e-con' ) && ! this.$el.parents( '.e-con' ).length ) {
			return;
		}

		this.$el.html5Draggable( {
			onDragStart: ( e ) => {
				e.stopPropagation();

				if ( this.getContainer().isLocked() ) {
					e.originalEvent.preventDefault();

					return;
				}

				// Need to stop this event when the element is absolute since it clashes with this one.
				// See `behaviors/widget-draggable.js`.
				if ( this.options.draggable?.isActive ) {
					return;
				}

				const helper = this.getDraggableHelper();
				this.$el[ 0 ].appendChild( helper );

				// Set the x & y coordinates of the helper the same as the legacy jQuery sortable.
				e.originalEvent.dataTransfer.setDragImage( helper, 25, 20 );

				// Remove the helper element as soon as it's set as a drag image, since the element must be
				// rendered for at least a fraction of a second in order to set it as a drag image.
				setTimeout( () => {
					helper.remove();
				} );

				this.onDragStart( e );

				elementor.channels.editor.reply( 'element:dragged', this );
			},
			onDragEnd: ( e ) => {
				e.stopPropagation();

				this.onDragEnd( e );
			},

			groups: [ 'elementor-element' ],
		} );
	},

	async getDataFromCacheOrBackend( valueToParse, dynamicSettings ) {
		try {
			return elementor.dynamicTags.parseTagsText( valueToParse, dynamicSettings, elementor.dynamicTags.getTagDataContent );
		} catch {
			await new Promise( ( resolve ) => {
				elementor.dynamicTags.refreshCacheFromServer( () => {
					resolve();
				} );
			} );

			return ! _.isEmpty( elementor.dynamicTags.cache )
				? elementor.dynamicTags.parseTagsText( valueToParse, dynamicSettings, elementor.dynamicTags.getTagDataContent )
				: false;
		}
	},

	getChangedDynamicControlKey( settings ) {
		const changedControlKey = this.findUniqueKey( settings?.changed?.__dynamic__, settings?._previousAttributes?.__dynamic__ )[ 0 ];

		if ( changedControlKey ) {
			return changedControlKey;
		}

		return Object.keys( settings.changed )[ 0 ] !== '__dynamic__'
			? Object.keys( settings.changed )[ 0 ]
			: Object.keys( settings.changed.__dynamic__ )[ 0 ];
	},

	getChangedDataForRemovedItem( settings, changedControlKey, bindingSetting ) {
		return settings.attributes?.[ changedControlKey ]?.[ bindingSetting ] || settings.attributes?.[ changedControlKey ];
	},

	getChangedDataForAddedItem( settings, changedControlKey, bindingSetting ) {
		return settings.attributes?.__dynamic__?.[ changedControlKey ]?.[ bindingSetting ] || settings.attributes?.__dynamic__?.[ changedControlKey ];
	},

	getChangedData( settings, changedControlKey, bindingSetting ) {
		const changedDataForRemovedItem = this.getChangedDataForRemovedItem( settings, changedControlKey, bindingSetting ),
			changedDataForAddedItem = this.getChangedDataForAddedItem( settings, changedControlKey, bindingSetting );

		return changedDataForAddedItem || changedDataForRemovedItem;
	},

	/**
	 * Function getTitleWithAdvancedValues().
	 *
	 * Renders before / after / fallback for dynamic item titles.
	 *
	 * @param {Object} settings
	 * @param {string} text
	 */
	getTitleWithAdvancedValues( settings, text ) {
		const { attributes, _previousAttributes: previousAttributes } = settings;

		if ( this.compareSettings( attributes, previousAttributes, 'fallback' ) ) {
			text = text.replace( new RegExp( previousAttributes.fallback ), '' );
		}

		if ( ! text || attributes.fallback === text ) {
			return attributes.fallback || '';
		}

		if ( this.compareSettings( attributes, previousAttributes, 'before' ) ) {
			text = text.replace( previousAttributes.before, '' );
		}

		if ( this.compareSettings( attributes, previousAttributes, 'after' ) ) {
			text = text.replace( new RegExp( previousAttributes.after + '$' ), '' );
		}

		if ( ! text ) {
			return attributes.fallback || '';
		}

		const newBefore = this.getNewSettingsValue( attributes, previousAttributes, 'before' ),
			newAfter = this.getNewSettingsValue( attributes, previousAttributes, 'after' );

		text = newBefore + text;
		text += newAfter;

		return text;
	},

	compareSettings( attributes, previousAttributes, key ) {
		return previousAttributes[ key ] && previousAttributes[ key ] !== attributes[ key ];
	},

	getNewSettingsValue( attributes, previousAttributes, key ) {
		return previousAttributes[ key ] !== attributes[ key ] ? ( attributes[ key ] || '' ) : '';
	},

	getRepeaterItemActiveIndex() {
		return this.getContainer().renderer.view.model.changed.editSettings.changed.activeItemIndex ||
			this.getContainer().renderer.view.model.changed.editSettings.attributes.activeItemIndex;
	},

	tryHandleDynamicCoverSettings( dataBinding, settings ) {
		if ( ! this.isAdvancedDynamicSettings( settings.attributes ) ) {
			return false;
		}

		this.isRendering = true;

		dataBinding.el.textContent = this.getTitleWithAdvancedValues( settings, dataBinding.el.textContent );

		return true;
	},

	isAdvancedDynamicSettings( attributes ) {
		return 'before' in attributes && 'after' in attributes && 'fallback' in attributes;
	},
} );

module.exports = BaseElementView;
