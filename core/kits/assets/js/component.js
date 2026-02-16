import * as hooks from './hooks';
import * as commands from './commands/';
import Repeater from './repeater';
import ComponentBase from 'elementor-editor/component-base';

export default class extends ComponentBase {
	pages = {};
	siteSettingsSession = {
		visitedItems: [],
		savedItems: [],
		hasSaved: false,
	};

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
					return (
						'kit' !== elementor.documents.getCurrent().config.type &&
						'edit' === elementor.channels.dataEditMode.request( 'activeMode' )
					);
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
		if ( tab !== this.currentTab ) {
			this.currentTab = tab;
			this.trackVisitedTab( tab );
			elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
		}

		this.activateControl( args.activeControl );
	}

	trackVisitedTab( tabName ) {
		if ( tabName && ! this.siteSettingsSession.visitedItems.includes( tabName ) ) {
			this.siteSettingsSession.visitedItems.push( tabName );
		}
	}

	trackSavedItem( itemName ) {
		if ( itemName && ! this.siteSettingsSession.savedItems.includes( itemName ) ) {
			this.siteSettingsSession.savedItems.push( itemName );
		}
	}

	getSiteSettingsSessionData() {
		return { ...this.siteSettingsSession };
	}

	resetSiteSettingsSession() {
		this.siteSettingsSession = {
			visitedItems: [],
			savedItems: [],
			hasSaved: false,
		};
	}
}
