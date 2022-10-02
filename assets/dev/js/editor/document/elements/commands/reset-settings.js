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
	}

	#updateGlobalSettings( { container, options, settings } ) {
		Object.entries( settings.__globals__ || {} ).forEach( ( [ controlName, globalValue ] ) => {
			const isGlobalActive = container.settings.get( '__globals__' )?.[ controlName ];

			$e.run( isGlobalActive ? 'document/globals/settings' : 'document/globals/enable', {
				container,
				settings: { [ controlName ]: globalValue },
			} );
		} );
	}

	#getDefaultValues( controls, only = [] ) {
		return Object.entries( controls )
			.filter( ( [ controlName, control ] ) =>
				0 === only.length || only.includes( controlName ),
			)
			.reduce( ( carry, [ controlName, control ] ) => {
				const values = { [ controlName ]: control.default };

				if ( control?.global?.default ) {
					values.__globals__ = {
						...( carry.__globals__ || {} ),
						[ controlName ]: control.global.default,
					};
				}

				return { ...carry, ...values };
			}, {} );
	}
}

export default ResetSettings;
