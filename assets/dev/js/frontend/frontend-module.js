var Module = require( '../utils/module' ),
	FrontendModule;

FrontendModule = Module.extend( {
	__construct: function( $element ) {
		this.$element  = $element;
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		var elementSettings;

		if ( elementorFrontend.isEditMode() ) {
			var settings = elementorFrontend.config.elements.data[ this.getModelCID() ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.widgetType ];

			elementSettings = _.pick( settings, settingsKeys );
		} else {
			elementSettings = this.$element.data( 'settings' );
		}

		return this.getItems( elementSettings, setting );
	}
} );

FrontendModule.prototype.getElementName = function() {};

module.exports = FrontendModule;
