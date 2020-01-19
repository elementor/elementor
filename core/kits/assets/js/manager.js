import Component from './component';
import panelView from './panel';
import PanelHeaderBehavior from './panel-header-behavior';

export default class extends elementorModules.editor.utils.Module {
	addPanelPage() {
		elementor.getPanelView().addPage( 'kit_settings', {
			view: panelView,
			title: elementor.translate( 'Theme Style' ),
			name: 'kit_settings',
		} );
	}

	addPanelMenuItem() {
		const menu = elementor.modules.layouts.panel.pages.menu.Menu;

		menu.addItem( {
			name: 'theme-style',
			icon: 'eicon-paint-brush',
			title: elementor.translate( 'Theme Style' ),
			type: 'page',
			callback: () => $e.run( 'panel/global/open' ),
		}, 'style', 'global-colors' );
	}

	loadKitDocument() {
		elementor.documents.request( elementor.config.kit_id );
	}

	addHeaderBehavior( behaviors ) {
			behaviors.kit = {
				behaviorClass: PanelHeaderBehavior,
			};

			return behaviors;
	}

	onInit() {
		super.onInit();

		elementorCommon.elements.$window.on( 'elementor:loaded', () => {
			elementor.hooks.addFilter( 'panel/header/behaviors', this.addHeaderBehavior );

			elementor.on( 'panel:init', () => {
				this.addPanelPage();

				this.addPanelMenuItem();

				// Cache.
				this.loadKitDocument();
			} );
		} );

		$e.components.register( new Component( { manager: this } ) );
	}
}
