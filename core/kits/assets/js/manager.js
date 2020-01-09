import Component from './component';
import panelView from './panel';
import Document from 'elementor-document/document'

const ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

export default class Settings extends elementorModules.ViewModule {
	model = null;

	hasChange = false;

	updateStylesheet( keepOldEntries ) {
		var controlsCSS = this.getControlsCSS();

		if ( ! keepOldEntries ) {
			controlsCSS.stylesheet.empty();
		}

		controlsCSS.addStyleRules(
			this.model.getStyleControls(),
			this.model.attributes,
			this.model.controls,
			[ /{{WRAPPER}}/g ],
			[ this.getSettings( 'cssWrapperSelector' ) ]
		);

		controlsCSS.addStyleToDocument();
	}

	getControlsCSS = function() {
		if ( ! this.controlsCSS ) {
			const container = this.getContainer();

			this.controlsCSS = new ControlsCSSParser( {
				id: container.id,
				settingsModel: container.settings,
			} );
		}

		return this.controlsCSS;
	};

	getContainer( document ) {
		if ( ! this.container ) {
			this.model = new elementorModules.editor.elements.models.BaseSettings( this.getSettings( 'settings' ), {
				controls: this.getSettings( 'controls' ),
			} );

			this.model.on( 'change', this.onModelChange.bind( this ) );

			const editModel = new Backbone.Model( {
				id: 'kit',
				elType: 'kit',
				settings: this.model,
			} );

			this.container = new elementorModules.editor.Container( {
				id: editModel.id,
				type: 'kit',
				document: document,
				children: new Backbone.Model(),
				model: editModel,
				settings: editModel.get( 'settings' ),
				view: 'TODO: @see kits/assets/js/component.js',
				label: document.config.panel.title,
				controls: editModel.controls,
				renderer: false,
			} );
		}

		return this.container;
	}

	addPanelPage() {
		elementor.documents.request( elementor.config.kit_id ).then( ( config ) => {

			const document = new Document( config ),
				container = this.getContainer( document );

			document.container = container;

			elementor.documents.add( document );

			elementor.getPanelView().addPage( 'kit_settings', {
				view: panelView,
				title: 'global_theme_style',
				name: 'kit_settings',
				fullPage: true,
				options: {
					container,
					model: container.model,
					controls: container.settings.controls,
					name: 'kit',
				},
			} );
		} );
	}

	addPanelMenuItem() {
		const menu = elementor.modules.layouts.panel.pages.menu.Menu;

		menu.getGroups().add( {
			name: 'global',
			title: elementor.translate( 'global_settings' ),
			items: [],
		}, { at: 0 } );

		menu.addItem( {
			name: 'theme-style',
			icon: 'eicon-paint-brush',
			title: elementor.translate( 'Theme Style' ),
			type: 'page',
			callback: () => $e.route( 'panel/global/style' ),
		}, 'global' );

		// menu.addItem( {
		// 	name: 'theme-templates',
		// 	icon: 'eicon-font',
		// 	title: elementor.translate( 'theme_templates' ),
		// 	type: 'page',
		// 	callback: () => $e.route( 'panel/global/theme-templates' ),
		// }, 'global' );
		//
		// menu.addItem( {
		// 	name: 'site-settings',
		// 	icon: 'eicon-cogs',
		// 	title: elementor.translate( 'site_settings' ),
		// 	type: 'page',
		// 	callback: () => $e.route( 'panel/global/site-settings' ),
		// }, 'global' );
	}

	onModelChange() {
		this.hasChange = true;

		this.getControlsCSS().stylesheet.empty();

		this.updateStylesheet( true );
	}

	onElementorPreviewLoaded() {
		this.addPanelPage();

		this.addPanelMenuItem();
	}

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		jQuery( window ).on( 'elementor:init', () => elementor.on( 'preview:loaded', this.onElementorPreviewLoaded.bind( this ) ) );

		$e.components.register( new Component( { manager: this } ) );
	}
}
