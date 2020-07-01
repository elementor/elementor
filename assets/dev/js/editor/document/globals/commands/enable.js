import DisableEnable from './base/disable-enable';

export class Enable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			container.globals.set( settings );

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.render();

			// Clear custom local settings.
			Object.keys( settings ).forEach( ( key ) => {
				container.settings.set( key, container.controls[ key ].default );
			} );
		} );
	}
}

export default Enable;
