var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	Stylesheet = require( 'elementor-utils/stylesheet' ),
	BaseElementView;

BaseElementView = Marionette.CompositeView.extend( {
	tagName: 'div',

	stylesheet: null,

	id: function() {
		return this.getElementUniqueClass();
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

	getElementType: function() {
		return this.model.get( 'elType' );
	},

	getChildType: function() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	templateHelpers: function() {
		return {
			elementModel: this.model
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
		this.stylesheet = new Stylesheet();

		var viewportBreakpoints = elementor.config.viewportBreakpoints;

		this.stylesheet
			.addDevice( 'mobile', 0 )
			.addDevice( 'tablet', viewportBreakpoints.md )
			.addDevice( 'desktop', viewportBreakpoints.lg );
	},

	enqueueFonts: function() {
		var editModel = this.getEditModel(),
			settings = editModel.get( 'settings' );

		_.each( settings.getFontControls(), _.bind( function( control ) {
			var fontFamilyName = editModel.getSetting( control.name );
			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			var isVisible = elementor.helpers.isControlVisible( control, settings );

			if ( ! isVisible ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		}, this ) );
	},

	renderStyles: function() {
		var self = this,
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + self.model.cid ),
			editModel = self.getEditModel(),
			styleControls = editModel.get( 'settings' ).getStyleControls();

		self.stylesheet.empty();

		_.each( styleControls, function( control ) {
			var controlValue = editModel.getSetting( control.name );

			if ( ! _.isNumber( controlValue ) && _.isEmpty( controlValue ) ) {
				return;
			}

			var isVisible = elementor.helpers.isControlVisible( control, editModel.get( 'settings' ) );
			if ( ! isVisible ) {
				return;
			}

			_.each( control.selectors, function( cssProperty, selector ) {
				var outputSelector = selector.replace( /\{\{WRAPPER}}/g, '#' + self.getElementUniqueClass() ),
					outputCssProperty = elementor.getControlItemView( control.type ).replaceStyleValues( cssProperty, controlValue ),
					query;

				if ( _.isEmpty( outputCssProperty ) ) {
					return;
				}

				if ( control.responsive && 'desktop' !== control.responsive ) {
					query = { max: control.responsive };
				}

				self.stylesheet.addRules( outputSelector, outputCssProperty, query );
			} );
		} );

		if ( 'column' === self.model.get( 'elType' ) ) {
			var inlineSize = self.model.getSetting( '_inline_size' );

			if ( ! _.isEmpty( inlineSize ) ) {
				self.stylesheet.addRules( '#' + self.getElementUniqueClass(), { width: inlineSize + '%' }, { min: 'tablet' } );
			}
		}

		var styleHtml = self.stylesheet.toString();

		if ( _.isEmpty( styleHtml ) && ! $stylesheet.length ) {
			return;
		}

		if ( ! $stylesheet.length ) {
			elementor.$previewContents.find( 'head' ).append( '<style type="text/css" id="elementor-style-' + self.model.cid + '"></style>' );
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + self.model.cid );
		}

		$stylesheet.html( styleHtml );
	},

	renderCustomClasses: function() {
		this.$el.addClass( 'elementor-element' );

		var settings = this.getEditModel().get( 'settings' );

		_.each( settings.attributes, _.bind( function( value, attribute ) {
			if ( settings.isClassControl( attribute ) ) {
				var currentControl = settings.getControl( attribute );

				this.$el.removeClass( currentControl.prefix_class + settings.previous( attribute ) );

				var isVisible = elementor.helpers.isControlVisible( currentControl, settings );

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

	getElementUniqueClass: function() {
		return 'elementor-element-' + this.model.get( 'id' );
	},

	onClickEdit: function( event ) {
		event.preventDefault();

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
			editModel.setHtmlCache();
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
} );

module.exports = BaseElementView;
