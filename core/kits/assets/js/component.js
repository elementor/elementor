import * as hooks from './hooks';
import * as commands from './commands/';
import Repeater from './repeater';
import ComponentBase from 'elementor-editor/component-base';

export default class extends ComponentBase {
	pages = {};

	__construct( args ) {
		super.__construct( args );

		elementor.on( 'panel:init', () => {
			args.manager.addPanelPages();

			args.manager.addPanelMenuItem();
		} );

		elementor.hooks.addFilter( 'panel/header/behaviors', args.manager.addHeaderBehavior );

		elementor.addControlView( 'global-style-repeater', Repeater );
	}

	getNamespace() {
		return 'panel/global';
	}

	defaultRoutes() {
		return {
			menu: () => {
				elementor.getPanelView().setPage( 'kit_menu' );
				this.currentTab = 'menu';
			},
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			open: {
				keys: 'ctrl+k',
				dependency: () => {
					return 'kit' !== elementor.documents.getCurrent().config.type;
				},
			},
			back: {
				keys: 'esc',
				scopes: [ 'panel' ],
				dependency: () => {
					return elementor.documents.isCurrent( elementor.config.kit_id ) && ! jQuery( '.dialog-widget:visible' ).length;
				},
			},
		};
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	renderTab( tab, args ) {
		if ( tab !== this.currentTab ) { // Prevent re-rendering the same tab (with just different args).
			this.currentTab = tab;
			elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
		}

		this.activateControl( args.activeControl );
	}
}
