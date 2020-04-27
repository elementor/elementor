import DisableEnable from './base/disable-enable';

export class Disable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			Object.keys( settings ).forEach( ( setting ) => {
				const settingsToRestore = {};

				Object.entries( container.globals.attributes ).forEach( ( [ globalKey, globalValue ] ) => {
					/**
					 * TODO: Use of `$e.data.getCache` maybe abnormal, cannot use '$e.data.get' since its return:
					 * promise and disable is async command, Consider to use async hook.
					 */
					const data = $e.data.getCache( globalValue, {} );

					if ( data ) {
						if ( container.controls[ globalKey ].groupPrefix ) {
							Object.entries( data ).forEach( ( [ dataKey, dataValue ] ) => {
								const groupPrefix = container.controls[ globalKey ].groupPrefix,
									controlName = globalKey.replace( groupPrefix, '' ) + '_' + dataKey;

								settingsToRestore[ controlName ] = dataValue;
							} );
						} else {
							settingsToRestore[ globalKey ] = data;
						}
					}
				} );

				// TODO: Add dev-tools CSS to see if widget have globals.
				if ( Object.keys( settingsToRestore ).length ) {
					$e.run( 'document/elements/settings', {
						container,
						settings: settingsToRestore,
					} );
				}

				container.globals.unset( setting );
			} );

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.render();
		} );
	}
}

export default Disable;
