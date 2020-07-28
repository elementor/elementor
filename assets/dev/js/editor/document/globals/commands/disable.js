import DisableEnable from './base/disable-enable';

// TODO: Disable is the only command that extends DisableEnable which is async.
export class Disable extends DisableEnable {
	async apply( args ) {
		const { settings, containers = [ args.container ], options = {} } = args;

		const all = containers.map( async ( /* Container */ container ) => {
			container = container.lookup();

			let promises = [];

			// TODO rename `options.restore` => `options.unlink`.
			if ( options.restore ) {
				promises = Object.entries( container.globals.attributes ).map( async ( [ globalKey, globalValue ] ) => {
					// Means, the control default value were disabled.
					if ( ! globalValue ) {
						return;
					}

					return $e.run( 'document/globals/unlink', {
						container,
						options: { external: true },
						globalValue,
						setting: globalKey,
					} );
				} );

				await Promise.all( promises );
			}

			// Clear globals.
			Object.keys( settings ).forEach( ( setting ) =>
				container.globals.set( setting, '' )
			);

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.renderUI();
		} );

		await Promise.all( all );
	}
}

export default Disable;
