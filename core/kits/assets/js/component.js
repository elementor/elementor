import * as hooks from './hooks';
import * as commands from './commands/';

export default class extends $e.modules.ComponentBase {
	pages = {};

	getNamespace() {
		return 'panel/global';
	}

	defaultTabs() {
		return {
			'global-colors': {
				title: elementor.translate( 'global_colors' ),
				icon: 'eicon-global-colors',
				helpUrl: 'http://go.elementor.com/panel-global-colors',
			},
			'global-typography': {
				title: elementor.translate( 'global_fonts' ),
				icon: 'eicon-t-letter',
				helpUrl: 'http://go.elementor.com/panel-global-typography',
			},
			'theme-style-typography': {
				title: elementor.translate( 'typography' ),
				icon: 'eicon-typography-1',
				helpUrl: 'http://go.elementor.com/panel-global-typography',
			},
			'theme-style-buttons': {
				title: elementor.translate( 'buttons' ),
				icon: 'eicon-button',
				helpUrl: 'http://go.elementor.com/panel-global-theme-style-buttons',
			},
			'theme-style-images': {
				title: elementor.translate( 'images' ),
				icon: 'eicon-image',
				helpUrl: 'http://go.elementor.com/panel-global-theme-style-images',
			},
			'theme-style-form-fields': {
				title: elementor.translate( 'form_fields' ),
				icon: 'eicon-form-horizontal',
				helpUrl: 'http://go.elementor.com/panel-global-theme-style-form-fields',
			},
			'settings-site-identity': {
				title: elementor.translate( 'site_identity' ),
				icon: 'eicon-site-identity',
				helpUrl: 'http://go.elementor.com/panel-settings-site-identity',
			},
			'settings-background': {
				title: elementor.translate( 'background' ),
				icon: 'eicon-background',
				helpUrl: 'http://go.elementor.com/panel-settings-background',
			},
			'settings-layout': {
				title: elementor.translate( 'layout' ),
				icon: 'eicon-layout-settings',
				helpUrl: 'http://go.elementor.com/panel-settings-layout',
			},
			'settings-lightbox': {
				title: elementor.translate( 'lightbox' ),
				icon: 'eicon-lightbox-expand',
				helpUrl: 'http://go.elementor.com/panel-settings-lightbox',
			},
			'settings-custom-css': {
				title: elementor.translate( 'custom_css' ),
				icon: 'eicon-custom-css',
				helpUrl: 'http://go.elementor.com/panel-settings-custom-css',
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
