import ComponentBase from 'elementor-api/modules/component-base';
import CommandBase from 'elementor-api/modules/command-base';
import * as commandsInternal from './commands/internal/';

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
		return this.importCommands( commandsInternal );
	}

	defaultCommands() {
		return {
			open: () => new class Open extends CommandBase {
				apply = () => elementor.getPanelView().modeSwitcher.currentView.setMode( 'edit' );
			},
			close: () => new class Close extends CommandBase {
				apply = () => elementor.getPanelView().modeSwitcher.currentView.setMode( 'preview' );
			},
			toggle: () => new class Toggle extends CommandBase {
				apply = () => elementor.getPanelView().modeSwitcher.currentView.toggleMode();
			},
			exit: () => new class Toggle extends CommandBase {
				apply = () => $e.route( 'panel/menu' );
			},

			save: () => $e.command( 'document/save/draft' ),
			publish: () => $e.command( 'document/save/publish' ),

			'change-device-mode': ( _args ) => new class ChangeDeviceMode extends CommandBase {
				apply( args ) {
					const { device } = args,
						devices = [ 'desktop', 'tablet', 'mobile' ];

					if ( ! device ) {
						const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
						let modeIndex = devices.indexOf( currentDeviceMode );

						modeIndex++;

						if ( modeIndex >= devices.length ) {
							modeIndex = 0;
						}

						args.device = devices[ modeIndex ];
					}

					elementor.changeDeviceMode( device );
				}
			}( _args ),
		};
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
