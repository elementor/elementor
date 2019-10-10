import Component from './component';
import panelView from './panel';

const ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

export default class Settings extends elementorModules.ViewModule {
	model = null;

	hasChange = false;

	updateStylesheet( keepOldEntries ) {
		var controlsCSS = this.getControlsCSS();

		if ( ! keepOldEntries ) {
			controlsCSS.stylesheet.empty();
		}

		controlsCSS.addStyleRules( this.model.getStyleControls(), this.model.attributes, this.model.controls, [ /{{WRAPPER}}/g ], [ this.getSettings( 'cssWrapperSelector' ) ] );

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

	getContainer() {
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
				document: elementor.config.kit,
				children: new Backbone.Model(),
				model: editModel,
				settings: editModel.get( 'settings' ),
				view: 'TODO: @see kits/assets/js/component.js',
				label: elementor.config.kit.panel.title,
				controls: editModel.controls,
				renderer: false,
			} );
		}

		return this.container;
	}

	addPanelPage() {
		const container = this.getContainer();

		elementor.getPanelView().addPage( 'kit_settings', {
			view: panelView,
			title: container.label,
			name: 'kit_settings',
			fullPage: true,
			options: {
				container,
				model: container.model,
				controls: container.settings.controls,
				name: 'kit',
			},
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
			name: 'global-style',
			icon: 'eicon-paint-brush',
			title: elementor.translate( 'global_styles' ),
			type: 'page',
			callback: () => $e.route( 'panel/global/style' ),
		}, 'global' );

		menu.addItem( {
			name: 'theme-templates',
			icon: 'eicon-font',
			title: elementor.translate( 'theme_templates' ),
			type: 'page',
			callback: () => $e.route( 'panel/global/theme-templates' ),
		}, 'global' );

		menu.addItem( {
			name: 'site-settings',
			icon: 'eicon-cogs',
			title: elementor.translate( 'site_settings' ),
			type: 'page',
			callback: () => $e.route( 'panel/global/site-settings' ),
		}, 'global' );
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
