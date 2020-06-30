import CommandBase from 'elementor-api/modules/command-base';

// TODO: Add dev-tools CSS to see if widget have globals.
export class Unlink extends CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'globalValue', 'string', args );

		// TODO: validate global value is command format.
	}

	async apply( args ) {
		const { containers = [ args.container ], setting, globalValue } = args,
			localSettings = {};

		await Promise.all( containers.map( async ( /* Container */ container ) => {
			const result = await $e.data.get( globalValue );

			if ( result ) {
				const { value } = result.data,
					relatedControls = container.getRelatedControls( { [ setting ]: '' } );

				Object.values( relatedControls ).forEach( ( control ) => {
					const controlName = control.name;

					if ( 'object' === typeof value && value[ controlName ] ) {
						localSettings[ controlName ] = value[ controlName ];
					} else {
						localSettings[ controlName ] = value;
					}
				} );
			}

			return Promise.resolve();
		} ) );

		// Restore globals settings as custom local settings.
		if ( Object.keys( localSettings ).length ) {
			$e.run( 'document/elements/settings', {
				containers,
				settings: localSettings,
			} );
		}
	}
}

export default Unlink;
