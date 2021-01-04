import * as hooks from './hooks';
import * as commands from './commands/';
import Repeater from './repeater';

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
	}

	getNamespace() {
		return 'panel/global';
	}

	defaultTabs() {
		return {
			'global-colors': {
				title: __( 'Global Colors', 'elementor' ),
				icon: 'eicon-global-colors',
				helpUrl: 'https://go.elementor.com/global-colors',
			},
			'global-typography': {
				title: __( 'Global Fonts', 'elementor' ),
				icon: 'eicon-t-letter',
				helpUrl: 'https://go.elementor.com/global-fonts',
			},
			'theme-style-typography': {
				title: __( 'Typography', 'elementor' ),
				icon: 'eicon-typography-1',
				helpUrl: 'https://go.elementor.com/global-theme-style-typography',
			},
			'theme-style-buttons': {
				title: __( 'Buttons', 'elementor' ),
				icon: 'eicon-button',
				helpUrl: 'https://go.elementor.com/global-theme-style-buttons',
			},
			'theme-style-images': {
				title: __( 'Images', 'elementor' ),
				icon: 'eicon-image',
				helpUrl: 'https://go.elementor.com/global-theme-style-images',
			},
			'theme-style-form-fields': {
				title: __( 'Form Fields', 'elementor' ),
				icon: 'eicon-form-horizontal',
				helpUrl: 'https://go.elementor.com/global-theme-style-form-fields',
			},
			'settings-site-identity': {
				title: __( 'Site Identity', 'elementor' ),
				icon: 'eicon-site-identity',
				helpUrl: 'https://go.elementor.com/global-site-identity',
			},
			'settings-background': {
				title: __( 'Background', 'elementor' ),
				icon: 'eicon-background',
				helpUrl: 'https://go.elementor.com/global-background',
			},
			'settings-layout': {
				title: __( 'Layout', 'elementor' ),
				icon: 'eicon-layout-settings',
				helpUrl: 'https://go.elementor.com/global-layout',
			},
			'settings-lightbox': {
				title: __( 'Lightbox', 'elementor' ),
				icon: 'eicon-lightbox-expand',
				helpUrl: 'https://go.elementor.com/global-lightbox',
			},
			'settings-custom-css': {
				title: __( 'Custom CSS', 'elementor' ),
				icon: 'eicon-custom-css',
				helpUrl: 'https://go.elementor.com/global-custom-css',
			},
		};
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

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'kit_settings' ).content.currentView.activateTab( tab );
	}
}
