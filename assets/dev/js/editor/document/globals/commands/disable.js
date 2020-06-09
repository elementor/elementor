import DisableEnable from './base/disable-enable';

// TODO: Add dev-tools CSS to see if widget have globals.
export class Disable extends DisableEnable {
	async apply( args ) {
		const { settings, containers = [ args.container ], options = {} } = args;

		await containers.map( async ( container ) => {
			container = container.lookup();

			let localSettings = {},
				promises = [];

			// Get global values.
			if ( options.restore ) {
				promises = Object.entries( container.globals.attributes ).map( async ( [ globalKey, globalValue ] ) => {
					// Means, the control default value were disabled.
					if ( ! globalValue ) {
						return;
					}

					const promise = $e.data.get( globalValue ),
						result = await promise;

					if ( result ) {
						const { value } = result.data;

						if ( container.controls[ globalKey ].groupPrefix ) {
							Object.entries( value ).forEach( ( [ dataKey, dataValue ] ) => {
								const groupPrefix = container.controls[ globalKey ].groupPrefix,
									controlName = globalKey.replace( groupPrefix, '' ) + '_' + dataKey;

								localSettings[ controlName ] = dataValue;
							} );
						} else {
							localSettings[ globalKey ] = value;
						}
					}

					return promise;
				} );
			}

			await Promise.all( promises ).then( () => {
				// Restore globals settings as custom local settings.
				if ( options.restore && Object.keys( localSettings ).length ) {
					$e.run( 'document/elements/settings', {
						container,
						settings: localSettings,
					} );
				}

				// Clear globals.
				Object.keys( settings ).forEach( ( setting ) =>
					container.globals.set( setting, '' )
				);

				container.settings.set( '__globals__', container.globals.toJSON() );

				container.render();
			} );

			return Promise.resolve();
		} );
	}
}

export default Disable;
