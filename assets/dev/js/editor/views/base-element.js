var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	Stylesheet = require( 'elementor-utils/stylesheet' ),
	BaseElementView;

BaseElementView = Marionette.CompositeView.extend( {
	tagName: 'div',

	stylesheet: null,

	id: function() {
		return this.getElementUniqueID();
	},

	attributes: function() {
		var type = this.model.get( 'elType' );

		if ( 'widget'  === type ) {
			type = this.model.get( 'widgetType' );
		}
		return {
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
			'click @ui.saveButton': 'onClickSave'
		};
	},

	triggers: function() {
		return {
			'click @ui.duplicateButton': 'click:duplicate'
		};
	},

	$stylesheetElement: null,

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
		this.listenTo( editModel.get( 'editSettings' ), 'change', this.onSettingsChanged, this );

		this.on( 'render', function() {
			this.renderUI();
			this.runReadyTrigger();
		} );

		this.initRemoveDialog();

		this.initStylesheet();
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

	initStylesheet: function() {
		var viewportBreakpoints = elementor.config.viewportBreakpoints;

		this.stylesheet = new Stylesheet();

		this.stylesheet
			.addDevice( 'mobile', 0 )
			.addDevice( 'tablet', viewportBreakpoints.md )
			.addDevice( 'desktop', viewportBreakpoints.lg );
	},

	createStylesheetElement: function() {
		this.$stylesheetElement = Backbone.$( '<style>', { id: 'elementor-style-' + this.model.cid } );

		elementor.$previewContents.find( 'head' ).append( this.$stylesheetElement );
	},

	enqueueFonts: function() {
		var editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

		_.each( settings.getFontControls(), _.bind( function( control ) {
			var fontFamilyName = editModel.getSetting( control.name );

			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			if ( ! elementor.helpers.isControlVisible( control, settings.attributes ) ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		}, this ) );
	},

	addStyleRules: function( controls, values, placeholders, replacements ) {
		var self = this;

		_.each( controls, function( control ) {
			if ( control.styleFields ) {
				values[ control.name ].each( function( itemModel ) {
					self.addStyleRules(
						control.styleFields,
						itemModel.attributes,
						placeholders.concat( [ '{{CURRENT_ITEM}}' ] ),
						replacements.concat( [ '.elementor-repeater-item-' + itemModel.get( '_id' ) ] )
					);
				} );
			}

			self.addControlStyleRules( control, values, self.getEditModel().get( 'settings' ).controls, placeholders, replacements );
		} );
	},

	addControlStyleRules: function( control, values, controlsStack, placeholders, replacements ) {
		var self = this;

		BaseElementView.addControlStyleRules( self.stylesheet, control, controlsStack, function( control ) {
			return self.getStyleControlValue( control, values );
		}, placeholders, replacements );
	},

	addStyleToDocument: function() {
		var styleText = this.stylesheet.toString();

		styleText = elementor.hooks.applyFilters( 'editor/style/styleText', styleText, this );

		if ( _.isEmpty( styleText ) && ! this.$stylesheetElement ) {
			return;
		}

		if ( ! this.$stylesheetElement ) {
			this.createStylesheetElement();
		}

		this.$stylesheetElement.text( styleText );
	},

	getStyleControlValue: function( control, values ) {
		var value = values[ control.name ];

		if ( control.selectors_dictionary ) {
			value = control.selectors_dictionary[ value ] || value;
		}

		if ( ! _.isNumber( value ) && _.isEmpty( value ) ) {
			return;
		}

		if ( ! elementor.helpers.isControlVisible( control, values ) ) {
			return;
		}

		return value;
	},

	renderStyles: function() {
		var self = this,
			settings = self.getEditModel().get( 'settings' );

		self.stylesheet.empty();

		self.addStyleRules( settings.getStyleControls(), settings.attributes, [ /\{\{WRAPPER}}/g ], [ '#' + self.getElementUniqueID() ] );

		if ( 'column' === self.model.get( 'elType' ) ) {
			var inlineSize = settings.get( '_inline_size' );

			if ( ! _.isEmpty( inlineSize ) ) {
				self.stylesheet.addRules( '#' + self.getElementUniqueID(), { width: inlineSize + '%' }, { min: 'tablet' } );
			}
		}

		self.addStyleToDocument();
	},

	renderCustomClasses: function() {
		this.$el.addClass( 'elementor-element' );

		var settings = this.getEditModel().get( 'settings' );

		_.each( settings.attributes, _.bind( function( value, attribute ) {
			if ( settings.isClassControl( attribute ) ) {
				var currentControl = settings.getControl( attribute );

				this.$el.removeClass( currentControl.prefix_class + settings.previous( attribute ) );

				var isVisible = elementor.helpers.isControlVisible( currentControl, settings.attributes );

				if ( isVisible && ! _.isEmpty( settings.get( attribute ) ) ) {
					this.$el.addClass( currentControl.prefix_class + settings.get( attribute ) );
					this.$el.addClass( _.result( this, 'className' ) );
				}
			}
		}, this ) );
	},

	renderUI: function() {
		this.renderStyles();
		this.renderCustomClasses();
		this.enqueueFonts();
	},

	runReadyTrigger: function() {
		_.defer( _.bind( function() {
			elementorFrontend.elementsHandler.runReadyTrigger( this.$el );
		}, this ) );
	},

	getElementUniqueID: function() {
		return 'elementor-element-' + this.model.get( 'id' );
	},

	onClickEdit: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'preview' === activeMode ) {
			return;
		}

		this.edit();
	},

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
	},

	onSettingsChanged: function( settings ) {
		var editModel = this.getEditModel();

		if ( editModel.get( 'editSettings' ) !== settings ) {
			// Change flag only if server settings was changed
			elementor.setFlagEditorChange( true );
		}

		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var isContentChanged = false;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				var control = settings.getControl( settingKey );

				if ( ! control ) {
					return;
				}

				if ( control.force_render || ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) ) {
					isContentChanged = true;
				}
			} );

			if ( ! isContentChanged ) {
				this.renderUI();
				return;
			}
		}

		// Re-render the template
		var templateType = this.getTemplateType();

		if ( 'js' === templateType ) {
			this.getEditModel().setHtmlCache();
			this.render();
			editModel.renderOnLeave = true;
		} else {
			editModel.renderRemoteServer();
		}
	},

	onClickRemove: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.getRemoveDialog().show();
	},

	onClickSave: function( event ) {
		event.preventDefault();

		var model = this.model;

		elementor.templates.startModal( function() {
			elementor.templates.getLayout().showSaveTemplateView( model );
		} );
	}
}, {
	addControlStyleRules: function( stylesheet, control, controlsStack, valueCallback, placeholders, replacements ) {
		var value = valueCallback( control );

		if ( undefined === value ) {
			return;
		}

		_.each( control.selectors, function( cssProperty, selector ) {
			var outputCssProperty;

			try {
				outputCssProperty = cssProperty.replace( /\{\{(?:([^.}]+)\.)?([^}]*)}}/g, function( originalPhrase, controlName, placeholder ) {
					var parserControl = control,
						valueToInsert = value;

					if ( controlName ) {
						parserControl = _.findWhere( controlsStack, { name: controlName } );

						valueToInsert = valueCallback( parserControl );
					}

					var parsedValue = elementor.getControlItemView( parserControl.type ).getStyleValue( placeholder.toLowerCase(), valueToInsert );

					if ( '' === parsedValue ) {
						throw '';
					}

					return parsedValue;
				} );
			} catch ( e ) {
				return;
			}

			if ( _.isEmpty( outputCssProperty ) ) {
				return;
			}

			var devicePattern = /^\(([^)]+)\)/,
				deviceRule = selector.match( devicePattern );

			if ( deviceRule ) {
				selector = selector.replace( devicePattern, '' );

				deviceRule = deviceRule[1];
			}

			_.each( placeholders, function( placeholder, index ) {
				selector = selector.replace( placeholder, replacements[ index ] );
			} );

			var device = deviceRule,
				query;

			if ( ! device && control.responsive ) {
				device = control.responsive;
			}

			if ( device && 'desktop' !== device ) {
				query = { max: device };
			}

			stylesheet.addRules( selector, outputCssProperty, query );
		} );
	}
} );

module.exports = BaseElementView;
