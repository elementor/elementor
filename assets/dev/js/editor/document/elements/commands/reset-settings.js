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
		const { containers = [ args.container ], options = {}, settings = [] } = args;

		containers.forEach( ( container ) => {
			const controls = Object.entries( container.settings.controls ),
				defaultValues = {};

			controls.forEach( ( [ controlName, control ] ) => {
				// If settings were specific, restore only them.
				if ( settings && settings.length ) {
					if ( ! settings.find( ( key ) => key === controlName ) ) {
						return;
					}
				}

				defaultValues[ controlName ] = control.default;
			} );

			$e.run( 'document/elements/settings', {
				container,
				options,
				settings: defaultValues,
			} );

			container.render();
		} );
	}
}

export default ResetSettings;
