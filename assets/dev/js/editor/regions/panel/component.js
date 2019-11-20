export default class extends elementorModules.common.Component {
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

	defaultCommands() {
		return {
			open: () => elementor.getPanelView().modeSwitcher.currentView.setMode( 'edit' ),
			close: () => elementor.getPanelView().modeSwitcher.currentView.setMode( 'preview' ),
			toggle: () => elementor.getPanelView().modeSwitcher.currentView.toggleMode(),
			save: () => elementor.saver.saveDraft(),
			publish: () => elementor.saver.publish(),
			exit: () => $e.route( 'panel/menu' ),
			'change-device-mode': ( args ) => {
				const devices = [ 'desktop', 'tablet', 'mobile' ];
				if ( ! args.device ) {
					const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
					let modeIndex = devices.indexOf( currentDeviceMode );

					modeIndex++;

					if ( modeIndex >= devices.length ) {
						modeIndex = 0;
					}

					args.device = devices[ modeIndex ];
				}

				elementor.changeDeviceMode( args.device );
			},
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
