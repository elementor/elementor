import DisableEnable from './base/disable-enable';

export class Enable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			container.globals.set( settings );

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.render();
		} );
	}
}

export default Enable;
