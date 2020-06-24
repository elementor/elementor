import DisableEnable from './base/disable-enable';

export class Enable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			container.dynamic.set( settings );

			container.settings.set( '__dynamic__', container.dynamic.toJSON() );

			container.render();
		} );
	}
}

export default Enable;
