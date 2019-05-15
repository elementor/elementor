export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Panel';
		this.namespace = 'panel';
	}

	getRoutes() {
		return {
			menu: () => this.parent.setPage( 'menu' ),
			'global-colors': () => this.parent.setPage( 'colorScheme' ),
			'global-fonts': () => this.parent.setPage( 'typographyScheme' ),
			'color-picker': () => this.parent.setPage( 'colorPickerScheme' ),
		};
	}

	getCommands() {
		return {
			toggle: () => elementor.getPanelView().modeSwitcher.currentView.toggleMode(),
			save: () => elementor.saver.saveDraft(),
			exit: () => elementorCommon.route.to( 'panel/menu' ),
			'change-device-mode': () => {
				const devices = [ 'desktop', 'tablet', 'mobile' ],
					currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
				let modeIndex = devices.indexOf( currentDeviceMode );

				modeIndex++;

				if ( modeIndex >= devices.length ) {
					modeIndex = 0;
				}

				elementor.changeDeviceMode( devices[ modeIndex ] );
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
				// TODO: replace dependency with scope.
				dependency: () => {
					return ! jQuery( '.dialog-widget:visible' ).length;
				},
				scope: [ 'panel', 'preview' ],
			},
			'change-device-mode': {
				keys: 'ctrl+shift+m',
			},
		};
	}
}
