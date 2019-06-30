export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel';
	}

	getRoutes() {
		return {
			menu: () => this.context.setPage( 'menu' ),
			'global-colors': () => this.context.setPage( 'colorScheme' ),
			'global-fonts': () => this.context.setPage( 'typographyScheme' ),
			'color-picker': () => this.context.setPage( 'colorPickerScheme' ),
		};
	}

	getCommands() {
		return {
			toggle: () => elementor.getPanelView().modeSwitcher.currentView.toggleMode(),
			save: () => elementor.saver.saveDraft(),
			exit: () => elementorCommon.route.to( 'panel/menu' ),
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

	getShortcuts() {
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
