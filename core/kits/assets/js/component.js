import * as hooks from './hooks';
import * as commands from './commands/';
import Repeater from './repeater';
import Switcher from './switcher';

export default class extends $e.modules.ComponentBase {
	pages = {};

	__construct( args ) {
		super.__construct( args );

		elementor.on( 'panel:init', () => {
			args.manager.addPanelPages();

			args.manager.addPanelMenuItem();
		} );

		elementor.hooks.addFilter( 'panel/header/behaviors', args.manager.addHeaderBehavior );

		elementor.addControlView( 'global-style-repeater', Repeater );
		elementor.addControlView( 'global-style-switcher', Switcher );
	}

	getNamespace() {
		return 'panel/global';
	}

	defaultRoutes() {
		return {
			menu: () => {
				elementor.getPanelView().setPage( 'kit_menu' );
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

	renderTab( tab, args, oldTab ) {
		if ( oldTab !== tab ) {
			elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
		}

		this.activateControl( args.activeControl );
	}

	activateControl( controlPath ) {
		if ( ! controlPath ) {
			return;
		}

		const editor = elementor.getPanelView().getCurrentPageView();
		const currentView = editor.content.currentView;

		const controlView = this.getControlView( currentView, controlPath );
		controlView.activate?.();
	}

	getControlView( currentView, controlPath ) {
		const controls = controlPath.split( '/' );
		let controlView = currentView.getControlViewByName( controls[ 0 ] );

		controls.slice( 1 ).forEach( ( control ) => {
			controlView = controlView.getChildControlView?.( control );
		} );

		return controlView;
	}

	onCloseRoute( route, newRoute ) {
		super.onCloseRoute( route );

		// Only reset currentTab if on new route (not just different args). Prevent re-renders.
		if ( newRoute !== route ) {
			this.currentTab = this.getTabFromRoute( route );
		}
	}

	getTabFromRoute( route ) {
		return route.substring( route.lastIndexOf( '/' ) + 1 );
	}
}
