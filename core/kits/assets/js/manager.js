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
			icon: 'eicon-adjust',
			title: elementor.translate( 'Theme Style' ),
			type: 'page',
			callback: () => $e.run( 'panel/global/open' ),
		}, 'style' );
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
			if ( ! elementor.config.initial_document.panel.support_kit ) {
				return;
			}

			if ( ! elementor.config.user.can_edit_kit ) {
				return;
			}

			$e.components.register( new Component( { manager: this } ) );

			elementor.hooks.addFilter( 'panel/header/behaviors', this.addHeaderBehavior );

			elementor.on( 'panel:init', () => {
				this.addPanelPage();

				this.addPanelMenuItem();
			} );
		} );
	}
}
