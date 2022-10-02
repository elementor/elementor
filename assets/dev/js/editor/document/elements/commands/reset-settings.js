export class ResetSettings extends $e.modules.editor.document.CommandHistoryBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'reset_settings',
		};
	}

	apply( args ) {
		const {
			containers = [ args.container ],
			options = {},
			settings = [], // In case of `settings` is empty, reset all settings.
		} = args;

		containers.forEach( ( container ) => {
			const defaultValues = this.#getDefaultValues(
				container.settings.controls,
				settings || [],
			);

			this.#updateLocalSettings( { container, options, settings: defaultValues } );
			this.#updateGlobalSettings( { container, options, settings: defaultValues } );

			container.render();
			container.panel.refresh();
		} );
	}

	#updateLocalSettings( { container, options, settings } ) {
		const localSettings = Object.entries( settings )
			.filter( ( [ controlName ] ) => '__globals__' !== controlName );

		$e.run( 'document/elements/settings', {
			container,
			options,
			settings: Object.fromEntries( localSettings ),
		} );

		const globalSettingsToDisable = localSettings
			.filter( ( [ controlName, value ] ) => value && container?.globals?.get?.( controlName ) )
			.map( ( [ controlName, value ] ) => [ controlName, '' ] );

		$e.run( 'document/globals/disable', {
			container,
			settings: Object.fromEntries( globalSettingsToDisable ),
		} );
	}

	#updateGlobalSettings( { container, options, settings } ) {
		const globalSettings = Object.entries( settings.__globals__ || {} )
			.reduce( ( carry, [ controlName, globalValue ] ) => {
				const isGlobalActive = container?.globals?.get?.( controlName );

				if ( isGlobalActive ) {
					carry.settings[ controlName ] = globalValue;
				} else {
					carry.enable[ controlName ] = globalValue;
				}

				return carry;
			}, { enable: {}, settings: {} } );

		if ( Object.keys( globalSettings.enable ).length ) {
			$e.run( 'document/globals/enable', { container, settings: globalSettings.enable } );
		}

		if ( Object.keys( globalSettings.settings ).length ) {
			$e.run( 'document/globals/settings', { container, settings: globalSettings.settings } );
		}
	}

	#getDefaultValues( controls, only = [] ) {
		return Object.entries( controls )
			.filter( ( [ controlName, control ] ) =>
				0 === only.length || only.includes( controlName ),
			)
			.reduce( ( carry, [ controlName, control ] ) => {
				const isGlobalDefault = control.global?.default && ! control.default;

				if ( isGlobalDefault ) {
					return {
						...carry,
						__globals__: {
							...( carry.__globals__ || {} ),
							[ controlName ]: control.global?.default,
						},
					};
				}

				return {
					...carry,
					[ controlName ]: control.default,
				};
			}, {} );
	}
}

export default ResetSettings;
