import CommandHistory from '../../commands/base/command-history';

export class ResetSettings extends CommandHistory {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ], options: { useHistory = true } } = args;

		return useHistory && {
			containers,
			type: 'reset_settings',
		};
	}

	apply( args ) {
		const { containers = [ args.container ], settings = [], options: { useHistory = true } } = args;

		containers.forEach( ( container ) => {
			const controls = Object.entries( container.settings.controls ),
				defaultValues = {},
				settingsCommandBody = {
					container,
					settings: defaultValues,
				};

			controls.forEach( ( [ controlName, control ] ) => {
				// If settings were specific, restore only them.
				if ( settings && settings.length ) {
					if ( ! settings.find( ( key ) => key === controlName ) ) {
						return;
					}
				}

				defaultValues[ controlName ] = control.default;
			} );

			if ( useHistory ) {
				$e.run( 'document/elements/settings', settingsCommandBody );
			} else {
				$e.internal( 'document/elements/set-settings', settingsCommandBody );
			}

			container.render();
		} );
	}
}

export default ResetSettings;
