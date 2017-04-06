var ViewModule = require( 'elementor-utils/view-module' ),
	SettingsModel = require( 'elementor-models/base-settings' ),
	ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

module.exports = ViewModule.extend( {
	controlsCSS: null,

	model: null,

	hasChange: false,

	changeCallbacks: {
		post_title: function( newValue ) {
			var $title = elementorFrontend.getElements( '$document' ).find( elementor.config.page_title_selector );

			$title.text( newValue );
		},

		template: function() {
			this.save( function() {
				elementor.reloadPreview();

				elementor.once( 'preview:loaded', function() {
					elementor.getPanelView().setPage( 'settingsPage' );
				} );
			} );
		}
	},

	addChangeCallback: function( attribute, callback ) {
		this.changeCallbacks[ attribute ] = callback;
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
		this.controlsCSS.addStyleRules( this.model.getStyleControls(), this.model.attributes, this.model.controls, [ /\{\{WRAPPER}}/g ], [ 'body.elementor-page-' + elementor.config.post_id ] );
	},

	updateStylesheet: function() {
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

	save: function( callback ) {
		var self = this;

		if ( ! self.hasChange ) {
			return;
		}

		var settings = self.model.toJSON();

		settings.id = elementor.config.post_id;

		NProgress.start();

		elementor.ajax.send( 'save_page_settings', {
			data: settings,
			success: function() {
				NProgress.done();

				self.setSettings( 'savedSettings', settings );

				self.hasChange = false;

				if ( callback ) {
					callback.apply( self, arguments );
				}
			},
			error: function() {
				alert( 'An error occurred' );
			}
		} );
	},

	onInit: function() {
		this.initModel();

		this.initControlsCSSParser();

		this.debounceSave = _.debounce( this.save, 3000 );

		ViewModule.prototype.onInit.apply( this, arguments );
	},

	onModelChange: function( model ) {
		var self = this;

		self.hasChange = true;

		this.controlsCSS.stylesheet.empty();

		_.each( model.changed, function( value, key ) {
			if ( self.changeCallbacks[ key ] ) {
				self.changeCallbacks[ key ].call( self, value );
			}
		} );

		self.updateStylesheet();

		self.debounceSave();
	}
} );
