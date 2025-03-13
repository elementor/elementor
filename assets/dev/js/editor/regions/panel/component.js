import ComponentBase from 'elementor-editor/component-base';
import * as commands from './commands/';
import * as commandsInternal from './commands/internal/';

export default class Component extends ComponentBase {
	stateReadyOnce = false;

	#userInteractionsBlocked = false;

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
		return this.importCommands( commandsInternal );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+p',
				dependency: () => ! this.isUserInteractionsBlocked(),
			},
			save: {
				keys: 'ctrl+s',
			},
			exit: {
				keys: 'esc',
				// TODO: replace dependency with scopes.
				dependency: () => {
					return (
						! jQuery( '.dialog-widget:visible' ).length &&
						isEditMode()
					);
				},
				scopes: [ 'panel', 'preview' ],
			},
			'change-device-mode': {
				keys: 'ctrl+shift+m',
			},
			'page-settings': {
				keys: 'ctrl+shift+y',
				dependency: () => isEditMode(),
			},
			'editor-preferences': {
				keys: 'ctrl+shift+u',
				dependency: () => isEditMode(),
			},
		};
	}

	blockUserInteractions() {
		elementor.panel.$el.addClass( 'e-panel-block-interactions' );

		this.#userInteractionsBlocked = true;
	}

	unblockUserInteractions() {
		elementor.panel.$el.removeClass( 'e-panel-block-interactions' );

		this.#userInteractionsBlocked = false;
	}

	isUserInteractionsBlocked() {
		return this.#userInteractionsBlocked;
	}
}

function isEditMode() {
	return 'edit' === elementor.channels.dataEditMode.request( 'activeMode' );
}
