import DisableEnable from './base/disable-enable';

export class Enable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			container.dynamic.set( settings );

			$e.internal( 'document/elements/set-settings', {
				container,
				settings: {
					__dynamic__: container.dynamic.toJSON(),
				},
			} );
		} );
	}
}

export default Enable;
