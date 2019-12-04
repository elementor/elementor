var ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

module.exports = elementorModules.ViewModule.extend( {
	model: null,

	hasChange: false,

	changeCallbacks: {},

	addChangeCallback: function( attribute, callback ) {
		this.changeCallbacks[ attribute ] = callback;
	},

	bindEvents: function() {
		elementor.on( 'preview:loaded', this.onElementorPreviewLoaded );

		this.model.on( 'change', this.onModelChange );
	},

	addPanelPage: function() {
		var name = this.getSettings( 'name' );

		elementor.getPanelView().addPage( name + '_settings', {
			view: elementor.settings.panelPages[ name ] || elementor.settings.panelPages.base,
			title: this.getSettings( 'panelPage.title' ),
			options: {
				editedView: this.getEditedView(),
				model: this.model,
				controls: this.model.controls,
				name: name,
			},
		} );
	},

	getContainerId() {
		return this.getSettings( 'name' ) + '_settings';
	},

	// Emulate an element view/model structure with the parts needed for a container.
	getEditedView() {
		const id = this.getContainerId(),
			editModel = new Backbone.Model( {
				id,
				elType: id,
				settings: this.model,
		} );

		const container = new elementorModules.editor.Container( {
			type: id,
			id: editModel.id,
			model: editModel,
			settings: editModel.get( 'settings' ),
			view: false,
			label: this.getSettings( 'panelPage' ).title,
			controls: this.model.controls,
			renderer: false,
		} );

		return {
			getContainer: () => container,
			getEditModel: () => editModel,
			model: editModel,
		};
	},

	updateStylesheet: function( keepOldEntries ) {
		var controlsCSS = this.getControlsCSS();

		if ( ! keepOldEntries ) {
			controlsCSS.stylesheet.empty();
		}

		controlsCSS.addStyleRules( this.model.getStyleControls(), this.model.attributes, this.model.controls, [ /{{WRAPPER}}/g ], [ this.getSettings( 'cssWrapperSelector' ) ] );

		controlsCSS.addStyleToDocument();
	},

	initModel: function() {
		this.model = new elementorModules.editor.elements.models.BaseSettings( this.getSettings( 'settings' ), {
			controls: this.getSettings( 'controls' ),
		} );
	},

	initControlsCSSParser: function() {
		var controlsCSS;

		this.getControlsCSS = function() {
			if ( ! controlsCSS ) {
				controlsCSS = new ControlsCSSParser( {
					id: this.getSettings( 'name' ),
					settingsModel: this.model,
				} );
			}

			return controlsCSS;
		};
	},

	getDataToSave: function( data ) {
		return data;
	},

	save: function( callback ) {
		var self = this;

		if ( ! self.hasChange ) {
			return;
		}

		var settings = this.model.toJSON( { remove: [ 'default' ] } ),
			data = this.getDataToSave( {
				data: settings,
			} );

		if ( ! elementorCommonConfig.isTesting ) {
			NProgress.start();
		}

		elementorCommon.ajax.addRequest( 'save_' + this.getSettings( 'name' ) + '_settings', {
			data: data,
			success: function() {
				if ( ! elementorCommonConfig.isTesting ) {
					NProgress.done();
				}

				self.setSettings( 'settings', settings );

				self.hasChange = false;

				if ( callback ) {
					callback.apply( self, arguments );
				}
			},
			error: function() {
				alert( 'An error occurred' );
			},
		} );
	},

	onInit: function() {
		this.initModel();

		this.initControlsCSSParser();

		this.addPanelMenuItem();

		this.debounceSave = _.debounce( this.save, 3000 );

		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
	},

	/**
	 * BC for custom settings without a JS component.
	 */
	addPanelMenuItem: function() {
		const menuSettings = this.getSettings( 'panelPage.menu' );

		if ( ! menuSettings ) {
			return;
		}

		const namespace = 'panel/' + this.getSettings( 'name' ) + '-settings',
			menuItemOptions = {
			icon: menuSettings.icon,
			title: this.getSettings( 'panelPage.title' ),
			type: 'page',
			pageName: this.getSettings( 'name' ) + '_settings',
			callback: () => $e.route( `${ namespace }/settings` ),
		};

		$e.bc.ensureTab( namespace, 'settings', menuItemOptions.pageName );

		elementor.modules.layouts.panel.pages.menu.Menu.addItem( menuItemOptions, 'settings', menuSettings.beforeItem );
	},

	onModelChange: function( model ) {
		var self = this;

		self.hasChange = true;

		this.getControlsCSS().stylesheet.empty();

		_.each( model.changed, function( value, key ) {
			if ( self.changeCallbacks[ key ] ) {
				self.changeCallbacks[ key ].call( self, value );
			}
		} );

		self.updateStylesheet( true );

		self.debounceSave();
	},

	onElementorPreviewLoaded: function() {
		this.updateStylesheet();

		this.addPanelPage();

		if ( ! elementor.userCan( 'design' ) ) {
			$e.route( 'panel/page-settings/settings' );
		}
	},
} );
