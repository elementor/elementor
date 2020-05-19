import DisableEnable from './base/disable-enable';

// Run when a custom control value is set while the active value is a global
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
