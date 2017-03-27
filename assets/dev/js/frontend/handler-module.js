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
			var cid = self.getModelCID();

			elementorFrontend.addListenerOnce( cid, 'change:' + self.getElementName(), function( controlView, elementView ) {
				if ( elementView.model.cid !== cid ) {
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
		var elementSettings,
			modelCID = this.getModelCID();

		if ( elementorFrontend.isEditMode() && modelCID ) {
			var settings = elementorFrontend.config.elements.data[ modelCID ],
				activeControls = settings.getActiveControls(),
				activeValues = _.pick( settings.attributes, Object.keys( activeControls ) ),
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			elementSettings = _.pick( activeValues, settingsKeys );
		} else {
			elementSettings = this.$element.data( 'settings' ) || {};
		}

		return this.getItems( elementSettings, setting );
	}
} );

module.exports = HandlerModule;
