var ViewModule = require( 'elementor-utils/view-module' ),
	SettingsModel = require( 'elementor-models/base-settings' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

module.exports = ViewModule.extend( {
	controlsCSS: null,

	model: null,

	changeCallbacks: {
		post_title: function( newValue ) {
			var $title = elementorFrontend.getElements( '$document' ).find( elementor.config.page_title_selector );

			$title.text( newValue );
		}
	},

	getDefaultSettings: function() {
		return {
			savedSettings: elementor.config.page_settings.settings
		};
	},

	bindEvents: function() {
		elementor.on( 'preview:loaded', this.updateStylesheet );

		this.model.on( 'change', this.onModelChange );
	},

	renderStyles: function() {
		this.controlsCSS.addStyleRules( this.model.getStyleControls(), this.model.attributes, this.model.controls, [ /\{\{WRAPPER}}/g ], [ '.elementor-page-' + elementor.config.post_id ] );
	},

	updateStylesheet: function() {
		this.controlsCSS.stylesheet.empty();

		this.renderStyles();

		this.controlsCSS.addStyleToDocument();
	},

	initModel: function() {
		this.model = new SettingsModel( this.getSettings( 'savedSettings' ), {
			controls: elementor.config.page_settings.controls
		} );
	},

	initControlsCSSParser: function() {
		this.controlsCSS = new ControlsCSSParser();
	},

	resetModel: function() {
		this.model.set( this.getSettings( 'savedSettings' ) );
	},

	onInit: function() {
		this.initModel();

		this.initControlsCSSParser();

		ViewModule.prototype.onInit.apply( this, arguments );
	},

	onModelChange: function( model ) {
		var self = this,
			isStyleNeedUpdate = false;

		_.each( model.changed, function( value, key ) {
			if ( self.changeCallbacks[ key ] ) {
				self.changeCallbacks[ key ].call( self, value );
			}

			if ( self.model.controls[ key ].selectors ) {
				isStyleNeedUpdate = true;
			}
		} );

		if ( isStyleNeedUpdate ) {
			self.updateStylesheet();
		}
	}
} );
