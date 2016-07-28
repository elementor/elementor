var BaseSettingsModel = require( 'elementor-models/base-settings' ),
	BaseElementView;

BaseElementView = Marionette.CompositeView.extend( {
	tagName: 'div',

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

	baseEvents: {},

	elementEvents: {},

	getElementType: function() {
		return this.model.get( 'elType' );
	},

	getChildType: function() {
		return elementor.helpers.getElementChildType( this.getElementType() );
	},

	events: function() {
		return _.extend( {}, this.baseEvents, this.elementEvents );
	},

	getTemplateType: function() {
		return 'js';
	},

	initialize: function() {
		// grab the child collection from the parent model
		// so that we can render the collection as children
		// of this parent element
		this.collection = this.model.get( 'elements' );

		if ( this.collection ) {
			this.listenTo( this.collection, 'add remove reset', this.onCollectionChanged, this );
		}

		this.listenTo( this.model.get( 'settings' ), 'change', this.onSettingsChanged, this );
		this.listenTo( this.model.get( 'editSettings' ), 'change', this.onSettingsChanged, this );

		this.on( 'render', this.enqueueFonts );
		this.on( 'render', this.renderStyles );
		this.on( 'render', this.renderCustomClasses );
		this.on( 'render', this.runReadyTrigger );

		this.initRemoveDialog();
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

	enqueueFonts: function() {
		_.each( this.model.get( 'settings' ).getFontControls(), _.bind( function( control ) {
			var fontFamilyName = this.model.getSetting( control.name );
			if ( _.isEmpty( fontFamilyName ) ) {
				return;
			}

			var isVisible = elementor.helpers.isControlVisible( control, this.model.get( 'settings' ) );
			if ( ! isVisible ) {
				return;
			}

			elementor.helpers.enqueueFont( fontFamilyName );
		}, this ) );
	},

	renderStyles: function() {
		var styleHtml = '',
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + this.model.cid ),
			styleControls = this.model.get( 'settings' ).getStyleControls();

		_.each( styleControls, _.bind( function( control ) {
			var controlValue = this.model.getSetting( control.name );

			if ( ! _.isNumber( controlValue ) && _.isEmpty( controlValue ) ) {
				return;
			}

			var isVisibility = elementor.helpers.isControlVisible( control, this.model.get( 'settings' ) );
			if ( ! isVisibility ) {
				return;
			}

			_.each( control.selectors, _.bind( function( cssProperty, selector ) {
				var outputSelector = selector.replace( /\{\{WRAPPER\}\}/g, '#' + this.getElementUniqueClass() ),
					outputCssProperty = elementor.getControlItemView( control.type ).replaceStyleValues( cssProperty, controlValue );

				if ( _.isEmpty( outputCssProperty ) ) {
					return;
				}

				styleHtml += outputSelector + '{' + outputCssProperty + '}';
			}, this ) );
		}, this ) );

		if ( 'column' === this.model.get( 'elType' ) ) {
			var inlineSize = this.model.getSetting( '_inline_size' );
			if ( ! _.isEmpty( inlineSize ) ) {
				styleHtml += '@media (min-width: 768px) {#' + this.getElementUniqueClass() + '{width:' + inlineSize + '%;}';
			}
		}

		if ( 0 === $stylesheet.length ) {
			elementor.$previewContents.find( 'head' ).append( '<style type="text/css" id="elementor-style-' + this.model.cid + '"></style>' );
			$stylesheet = elementor.$previewContents.find( '#elementor-style-' + this.model.cid );
		}

		$stylesheet.html( styleHtml );
	},

	renderCustomClasses: function() {
		this.$el.addClass( 'elementor-element' );

		var settings = this.model.get( 'settings' );

		_.each( settings.attributes, _.bind( function( value, attribute ) {
			if ( settings.isClassControl( attribute ) ) {
				var currentControl = settings.getControl( attribute );

				this.$el.removeClass( currentControl.prefix_class + settings.previous( attribute ) );

				var isVisible = elementor.helpers.isControlVisible( currentControl, this.model.get( 'settings' ) );

				if ( isVisible && ! _.isEmpty( settings.get( attribute ) ) ) {
					this.$el.addClass( currentControl.prefix_class + settings.get( attribute ) );
					this.$el.addClass( _.result( this, 'className' ) );
				}
			}
		}, this ) );
	},

	runReadyTrigger: function() {
		_.defer( _.bind( function() {
			elementorBindUI.runReadyTrigger( this.$el );
		}, this ) );
	},

	getElementUniqueClass: function() {
		return 'elementor-element-' + this.model.get( 'id' );
	},

	onCollectionChanged: function() {
		elementor.setFlagEditorChange( true );
	},

	onSettingsChanged: function( settings ) {
		if ( this.model.get( 'editSettings' ) !== settings ) {
			// Change flag only if server settings was changed
			elementor.setFlagEditorChange( true );
		}

        this.renderStyles();
		this.renderCustomClasses();
		this.enqueueFonts();

		// Make sure is correct model
		if ( settings instanceof BaseSettingsModel ) {
			var isContentChanged = false;

			_.each( settings.changedAttributes(), function( settingValue, settingKey ) {
				if ( ! settings.isStyleControl( settingKey ) && ! settings.isClassControl( settingKey ) ) {
					isContentChanged = true;
				}
			} );

			if ( ! isContentChanged ) {
				return;
			}
		}

		// Re-render the template
		switch ( this.getTemplateType() ) {
			case 'js' :
				this.model.setHtmlCache();
				this.render();
				break;

			default :
				this.model.renderRemoteServer();
		}
	},

	onClickRemove: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.getRemoveDialog().show();
	}
} );

module.exports = BaseElementView;
