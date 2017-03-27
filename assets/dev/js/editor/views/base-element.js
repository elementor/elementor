var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' ),
	BaseElementView;

BaseElementView = Marionette.CompositeView.extend( {
	tagName: 'div',

	controlsCSSParser: null,

	className: function() {
		return this.getElementUniqueID();
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
			duplicateButton: '> .elementor-editor-element-settings .elementor-editor-element-duplicate',
			removeButton: '> .elementor-editor-element-settings .elementor-editor-element-remove',
			saveButton: '> .elementor-editor-element-settings .elementor-editor-element-save'
		};
	},

	events: function() {
		return {
			'click @ui.removeButton': 'onClickRemove',
			'click @ui.saveButton': 'onClickSave',
			'click @ui.duplicateButton': 'onClickDuplicate'
		};
	},

	getElementType: function() {
		return this.model.get( 'elType' );
	},

	getChildType: function() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	getChildView: function( model ) {
		var ChildView,
			elType = model.get( 'elType' );

		if ( 'section' === elType ) {
			ChildView = require( 'elementor-views/section' );
		} else if ( 'column' === elType ) {
			ChildView = require( 'elementor-views/column' );
		} else {
			ChildView = elementor.modules.WidgetView;
		}

		return elementor.hooks.applyFilters( 'element/view', ChildView, model, this );
	},

	templateHelpers: function() {
		return {
			elementModel: this.model,
			editModel: this.getEditModel()
		};
	},

	getTemplateType: function() {
		return 'js';
	},

	getEditModel: function() {
		return this.model;
	},

	initialize: function() {
		// grab the child collection from the parent model
		// so that we can render the collection as children
		// of this parent element
		this.collection = this.model.get( 'elements' );

		if ( this.collection ) {
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		var editModel = this.getEditModel();

		this.listenTo( editModel.get( 'settings' ), 'change', this.onSettingsChanged, this );
		this.listenTo( editModel.get( 'editSettings' ), 'change', this.onEditSettingsChanged, this );

		this.on( 'render', function() {
			this.renderUI();
			this.runReadyTrigger();
		} );

		this.initRemoveDialog();

		this.initControlsCSSParser();
	},

	edit: function() {
		elementor.getPanelView().openEditor( this.getEditModel(), this );
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addChildElement: function( itemData, options ) {
		options = options || {};

		var myChildType = this.getChildType();

		if ( -1 === myChildType.indexOf( itemData.elType ) ) {
			delete options.at;

			return this.children.last().addChildElement( itemData, options );
		}

		var newModel = this.addChildModel( itemData, options ),
			newView = this.children.findByModel( newModel );

		if ( 'section' === newView.getElementType() && newView.isInner() ) {
			newView.addEmptyColumn();
		}

		newView.edit();

		return newView;
	},

	addElementFromPanel: function( options ) {
		var elementView = elementor.channels.panelElements.request( 'element:selected' );

		var itemData = {
			id: elementor.helpers.getUniqueID(),
			elType: elementView.model.get( 'elType' )
		};

		if ( 'widget' === itemData.elType ) {
			itemData.widgetType = elementView.model.get( 'widgetType' );
		} else if ( 'section' === itemData.elType ) {
			itemData.elements = [];
			itemData.isInner = true;
		} else {
			return;
		}

		var customData = elementView.model.get( 'custom' );

		if ( customData ) {
			_.extend( itemData, customData );
		}

		this.addChildElement( itemData, options );
	},

	isCollectionFilled: function() {
		return false;
	},

	isInner: function() {
		return !! this.model.get( 'isInner' );
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				var elementTitle = this.model.getTitle();

				removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
					message: elementor.translate( 'dialog_confirm_delete', [ elementTitle.toLowerCase() ] ),
					headerMessage: elementor.translate( 'delete_element', [ elementTitle ] ),
					strings: {
						confirm: elementor.translate( 'delete' ),
						cancel: elementor.translate( 'cancel' )
					},
					defaultOption: 'confirm',
					onConfirm: _.bind( function() {
						this.model.destroy();
					}, this )
				} );
			}

			return removeDialog;
		};
	},

	initControlsCSSParser: function() {
		this.controlsCSSParser = new ControlsCSSParser( { id: this.model.cid } );
	},

	enqueueFonts: function() {
		var editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

		_.each( settings.getFontControls(), _.bind( function( control ) {
			var fontFamilyName = editModel.getSetting( control.name );

			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		}, this ) );
	},

	renderStyles: function() {
		var self = this,
			settings = self.getEditModel().get( 'settings' );

		self.controlsCSSParser.stylesheet.empty();

		self.controlsCSSParser.addStyleRules( settings.getStyleControls(), settings.attributes, self.getEditModel().get( 'settings' ).controls, [ /\{\{ID}}/g, /\{\{WRAPPER}}/g ], [ self.getID(), '#elementor .' + self.getElementUniqueID() ] );

		if ( 'column' === self.model.get( 'elType' ) ) {
			var inlineSize = settings.get( '_inline_size' );

			if ( ! _.isEmpty( inlineSize ) ) {
				self.controlsCSSParser.stylesheet.addRules( '#elementor .' + self.getElementUniqueID(), { width: inlineSize + '%' }, { min: 'tablet' } );
			}
		}

		self.controlsCSSParser.addStyleToDocument();

		var extraCSS = elementor.hooks.applyFilters( 'editor/style/styleText', '', this );

		if ( extraCSS ) {
			self.controlsCSSParser.elements.$stylesheetElement.append( extraCSS );
		}
	},

	renderCustomClasses: function() {
		var self = this;

		self.$el.addClass( 'elementor-element' );

		var settings = self.getEditModel().get( 'settings' );

		_.each( settings.attributes, function( value, attribute ) {
			if ( settings.isClassControl( attribute ) ) {
				var currentControl = settings.getControl( attribute ),
					previousClassValue = settings.previous( attribute ),
					classValue = value;

				if ( currentControl.classes_dictionary ) {
					if ( undefined !== currentControl.classes_dictionary[ previousClassValue ] ) {
						previousClassValue = currentControl.classes_dictionary[ previousClassValue ];
					}

					if ( undefined !== currentControl.classes_dictionary[ value ] ) {
						classValue = currentControl.classes_dictionary[ value ];
					}
				}

				self.$el.removeClass( currentControl.prefix_class + previousClassValue );

				var isVisible = elementor.helpers.isActiveControl( currentControl, settings.attributes );

				if ( isVisible && ! _.isEmpty( classValue ) ) {
					self.$el
						.addClass( currentControl.prefix_class + classValue )
						.addClass( _.result( self, 'className' ) );
				}
			}
		} );
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
		_.defer( _.bind( function() {
			elementorFrontend.elementsHandler.runReadyTrigger( this.$el );
		}, this ) );
	},

	getID: function() {
		return this.model.get( 'id' );
	},

	getElementUniqueID: function() {
		return 'elementor-element-' + this.getID();
	},

	duplicate: function() {
		this.trigger( 'request:duplicate' );
	},

	confirmRemove: function() {
		this.getRemoveDialog().show();
	},

	renderOnChange: function( settings ) {
		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var hasChanged = settings.hasChanged(),
				isContentChanged = ! hasChanged,
				isRenderRequired = ! hasChanged;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				var control = settings.getControl( settingKey );

				if ( ! control ) {
					isRenderRequired = true;

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

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
	},

	onEditSettingsChanged: function( changedModel ) {
		this.renderOnChange( changedModel );
	},

	onSettingsChanged: function( changedModel ) {
		elementor.setFlagEditorChange( true );

		this.renderOnChange( changedModel );
	},

	onClickEdit: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' !== activeMode ) {
			return;
		}

		this.edit();
	},

	onClickDuplicate: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.duplicate();
	},

	onClickRemove: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.confirmRemove();
	},

	onClickSave: function( event ) {
		event.preventDefault();

		var model = this.model;

		elementor.templates.startModal( function() {
			elementor.templates.getLayout().showSaveTemplateView( model );
		} );
	},

	onDestroy: function() {
		this.controlsCSSParser.removeStyleFromDocument();
	}
} );

module.exports = BaseElementView;
