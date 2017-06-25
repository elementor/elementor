var ViewModule = require( '../utils/view-module' ),
	HandlerModule;

HandlerModule = ViewModule.extend( {
	$element: null,

	onElementChange: null,

	__construct: function( settings ) {
		this.$element  = settings.$element;

		if ( elementorFrontend.isEditMode() ) {
			this.addEditorListener();
		}
	},

	addEditorListener: function() {
		var self = this;

		if ( self.onElementChange ) {
			var uniqueHandlerID = self.getModelCID() + self.$element.attr( 'data-element_type' ) + self.getConstructorID(),
				elementName = self.getElementName(),
				eventName = 'change';

			if ( 'global' !== elementName ) {
				eventName += ':' + elementName;
			}

			elementorFrontend.addListenerOnce( uniqueHandlerID, eventName, function( controlView, elementView ) {
				var elementViewHandlerID = elementView.model.cid + elementView.$el.attr( 'data-element_type' ) + self.getConstructorID();

				if ( elementViewHandlerID !== uniqueHandlerID ) {
					return;
				}

				self.onElementChange( controlView.model.get( 'name' ),  controlView, elementView );
			}, elementor.channels.editor );
		}
	},

	getElementName: function() {
		return this.$element.data( 'element_type' ).split( '.' )[0];
	},

	getID: function() {
		return this.$element.data( 'id' );
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		var elementSettings = {},
			modelCID = this.getModelCID();

		if ( elementorFrontend.isEditMode() && modelCID ) {
			var settings = elementorFrontend.config.elements.data[ modelCID ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			jQuery.each( settings.getActiveControls(), function( controlKey ) {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					elementSettings[ controlKey ] = settings.attributes[ controlKey ];
				}
			} );
		} else {
			elementSettings = this.$element.data( 'settings' ) || {};
		}

		return this.getItems( elementSettings, setting );
	}
} );

module.exports = HandlerModule;
