var ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

module.exports = elementorModules.ViewModule.extend( {
	model: null,

	hasChange: false,

	changeCallbacks: {},

	addChangeCallback( attribute, callback ) {
		this.changeCallbacks[ attribute ] = callback;
	},

	bindEvents() {
		elementor.on( 'document:loaded', this.onElementorDocumentLoaded );

		this.model.on( 'change', this.onModelChange );
	},

	unbindEvents() {
		elementor.off( 'document:loaded', this.onElementorDocumentLoaded );
	},

	addPanelPage() {
		var name = this.getSettings( 'name' );

		elementor.getPanelView().addPage( name + '_settings', {
			view: elementor.settings.panelPages[ name ] || elementor.settings.panelPages.base,
			title: this.getSettings( 'panelPage.title' ),
			options: {
				editedView: this.getEditedView(),
				model: this.model,
				controls: this.model.controls,
				name,
			},
		} );
	},

	getContainerType() {
		return this.getSettings( 'name' ) + '_settings';
	},

	/**
	 * @deprecated since 3.7.0, use `getContainerType()` instead.
	 */
	getContainerId() {
		elementorDevTools.deprecation.deprecated( 'getContainerId()', '3.7.0', 'getContainerType()' );

		return this.getContainerType();
	},

	// Emulate an element view/model structure with the parts needed for a container.
	getEditedView() {
		const documentElementType = elementor.elementsManager.getElementTypeClass( 'document' ),
			ModelClass = documentElementType.getModel(),
			type = this.getContainerType(),
			editModel = new ModelClass( {
				id: type,
				elType: type,
				settings: this.model,
			} );

		const container = new elementorModules.editor.Container( {
			type,
			id: type,
			model: editModel,
			settings: editModel.get( 'settings' ),
			view: false,
			parent: false,
			label: this.getSettings( 'panelPage' ).title,
			controls: this.model.controls,
			document: this.getDocument(),
			renderer: false,
		} );

		return {
			getContainer: () => container,
			getEditModel: () => editModel,
			model: editModel,
			container,
		};
	},

	getDocument() {
		return false;
	},

	updateStylesheet( keepOldEntries ) {
		var controlsCSS = this.getControlsCSS();

		if ( ! keepOldEntries ) {
			controlsCSS.stylesheet.empty();
		}

		this.model.handleRepeaterData( this.model.attributes );

		controlsCSS.addStyleRules( this.model.getStyleControls(), this.model.attributes, this.model.controls, [ /{{WRAPPER}}/g ], [ this.getSettings( 'cssWrapperSelector' ) ] );

		controlsCSS.addStyleToDocument( {
			// Ensures we don't override default global style
			at: 'before',
			of: '#elementor-style-e-global-style',
		} );
	},

	initModel() {
		this.model = new elementorModules.editor.elements.models.BaseSettings( this.getSettings( 'settings' ), {
			controls: this.getSettings( 'controls' ),
		} );
	},

	getStyleId() {
		return this.getSettings( 'name' );
	},

	initControlsCSSParser() {
		var controlsCSS;

		this.destroyControlsCSS = function() {
			controlsCSS.removeStyleFromDocument();
		};

		this.getControlsCSS = function() {
			if ( ! controlsCSS ) {
				controlsCSS = new ControlsCSSParser( {
					id: this.getStyleId(),
					settingsModel: this.model,
					context: this.getEditedView(),
				} );
			}

			return controlsCSS;
		};
	},

	getDataToSave( data ) {
		return data;
	},

	async save( callback ) {
		var self = this;

		if ( ! self.hasChange ) {
			return;
		}

		var settings = this.model.toJSON( { remove: [ 'default' ] } ),
			data = this.getDataToSave( {
				data: settings,
			} );

		NProgress.start();

		return elementorCommon.ajax.addRequest( 'save_' + this.getSettings( 'name' ) + '_settings', {
			data,
			success() {
				NProgress.done();

				self.setSettings( 'settings', settings );

				self.hasChange = false;

				if ( callback ) {
					callback.apply( self, arguments );
				}
			},
			error() {
				// eslint-disable-next-line no-alert
				alert( 'An error occurred.' );
			},
		} );
	},

	onInit() {
		this.initModel();

		this.initControlsCSSParser();

		this.addPanelMenuItem();

		this.debounceSave = _.debounce( this.save, 3000 );

		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
	},

	/**
	 * BC for custom settings without a JS component.
	 */
	addPanelMenuItem() {
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

	onModelChange( model ) {
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

	onElementorDocumentLoaded() {
		this.updateStylesheet();

		this.addPanelPage();
	},

	destroy() {
		this.unbindEvents();

		this.model.destroy();
	},
} );
