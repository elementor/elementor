var Module = require( '../utils/module' ),
	FrontendModule;

FrontendModule = Module.extend( {
	__construct: function( $element ) {
		this.$element  = $element;
	},

	bindEvents: function() {
		var self = this;

		if ( self.onWidgetChange && elementorFrontend.isEditMode() ) {
			var cid = self.getModelCID();

			elementorFrontend.addListenerOnce( cid, 'change:' + self.getElementName(), function( controlView, elementView ) {
				if ( elementView.model.cid !== cid ) {
					return;
				}

				self.onWidgetChange( controlView.model.get( 'name' ) );
			}, elementor.channels.editor );
		}
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
	},

	getClosureMethodsNames: function() {
		return [ 'onWidgetChange' ];
	},

	onInit: function() {
		this.bindEvents();
	}
} );

FrontendModule.prototype.getElementName = function() {};

module.exports = FrontendModule;
