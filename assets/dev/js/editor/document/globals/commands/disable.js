import DisableEnable from './base/disable-enable';

// Run when a custom color is chosen while the active color is a global
export class Disable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			Object.keys( settings ).forEach( ( setting ) => {
				container.globals.unset( setting );
			} );

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.render();
		} );
	}
}

export default Disable;
