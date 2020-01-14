import Component from './component';
import panelView from './panel';

const ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

export default class Settings extends elementorModules.editor.utils.Module {
	addPanelPage() {
		elementor.getPanelView().addPage( 'kit_settings', {
			view: panelView,
			title: 'global_theme_style',
			name: 'kit_settings',
			fullPage: true,
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
			callback: () => $e.run( 'panel/global/open' ),
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

	onInit() {
		super.onInit();

		jQuery( window ).on( 'elementor:init', () => {
			elementor.on( 'panel:init', () => {
				this.addPanelPage();

				this.addPanelMenuItem();
			} );
		} );

		$e.components.register( new Component( { manager: this } ) );
	}
}
