import DisableEnable from './base/disable-enable';

export class Disable extends DisableEnable {
	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			Object.keys( settings ).forEach( ( setting ) => {
				container.dynamic.unset( setting );
			} );

			$e.internal( 'document/elements/set-settings', {
				container,
				settings: {
					__dynamic__: container.dynamic.toJSON(),
				},
			} );
		} );
	}
}

export default Disable;
