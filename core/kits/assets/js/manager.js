import Component from './component';
import panelView from './panel';

const ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );
import PanelHeaderBehavior from './panel-header-behavior';

export default class Settings extends elementorModules.editor.utils.Module {
	addPanelPage() {
		elementor.getPanelView().addPage( 'kit_settings', {
			view: panelView,
			title: elementor.translate( 'Theme Style' ),
			name: 'kit_settings',
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

	addHeaderBehavior( behaviors ) {
			behaviors.kit = {
				behaviorClass: PanelHeaderBehavior,
			};

			return behaviors;
	}

	onInit() {
		super.onInit();

		jQuery( window ).on( 'elementor:init', () => {
			elementor.hooks.addFilter( 'panel/header/behaviors', this.addHeaderBehavior );

			elementor.on( 'panel:init', () => {
				this.addPanelPage();

				this.addPanelMenuItem();
			} );
		} );

		$e.components.register( new Component( { manager: this } ) );
	}
}
