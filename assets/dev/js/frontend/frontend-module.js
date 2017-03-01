	FrontendModule;
var ViewModule = require( '../utils/view-module' ),

FrontendModule = Module.extend( {
	$element: null,

	__construct: function( $element ) {
		this.$element  = $element;
	},

	bindEvents: function() {
		var self = this;

		if ( self.onElementChange && elementorFrontend.isEditMode() ) {
			var cid = self.getModelCID();

			elementorFrontend.addListenerOnce( cid, 'change:' + self.getElementName(), function( controlView, elementView ) {
				if ( elementView.model.cid !== cid ) {
					return;
				}

				self.onElementChange( controlView.model.get( 'name' ) );
			}, elementor.channels.editor );
		}
	},

	getElementName: function() {},

	getID: function() {
		return this.$element.data( 'id' );
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		var elementSettings;

		if ( elementorFrontend.isEditMode() ) {
			var settings = elementorFrontend.config.elements.data[ this.getModelCID() ],
				activeControls = settings.getActiveControls(),
				activeValues = _.pick( settings.attributes, Object.keys( activeControls ) ),
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			elementSettings = _.pick( activeValues, settingsKeys );
		} else {
			elementSettings = this.$element.data( 'settings' );
		}

		return this.getItems( elementSettings, setting );
	},
	}
} );


module.exports = FrontendModule;
