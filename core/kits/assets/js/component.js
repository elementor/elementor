import EnqueueFonts from './hooks/ui/settings/enqueue-fonts';
import * as commands from './commands/';

export default class extends $e.modules.ComponentBase {
	pages = {};

	getNamespace() {
		return 'panel/global';
	}

	registerAPI() {
		super.registerAPI();

		new EnqueueFonts();
	}

	defaultRoutes() {
		return {
			style: () => this.renderContent( 'style' ),
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			back: {
				keys: 'esc',
				scopes: [ 'panel' ],
				dependency: () => {
					return elementor.documents.isCurrent( elementor.config.kit_id ) && ! jQuery( '.dialog-widget:visible' ).length;
				},
			},
		};
	}

	renderContent( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
