import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel';
	}

	defaultRoutes() {
		return {
			menu: () => this.manager.setPage( 'menu' ),
			'global-colors': () => this.manager.setPage( 'colorScheme' ),
			'global-fonts': () => this.manager.setPage( 'typographyScheme' ),
			'editor-preferences': () => this.manager.setPage( 'editorPreferences_settings' ).activateTab( 'settings' ),
		};
	}

	defaultCommandsInternal() {
		return {
			'open-default': () => $e.route( elementor.documents.getCurrent().config.panel.default_route, { refresh: true } ),
			'state-loading': () => elementorCommon.elements.$body.addClass( 'elementor-panel-loading' ),
			'state-ready': () => elementorCommon.elements.$body.removeClass( 'elementor-panel-loading' ),
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+p',
			},
			save: {
				keys: 'ctrl+s',
			},
			exit: {
				keys: 'esc',
				// TODO: replace dependency with scopes.
				dependency: () => {
					return ! jQuery( '.dialog-widget:visible' ).length;
				},
				scopes: [ 'panel', 'preview' ],
			},
			'change-device-mode': {
				keys: 'ctrl+shift+m',
			},
		};
	}
}
