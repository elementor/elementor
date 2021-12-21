import CommandNavigator from './base/command-navigator';

export class Collapse extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			$e.store.dispatch(
				$e.store.get( 'document/elements/folding' ).actions.toggle( {
					containerId: container.id,
					state: false,
				} )
			);

			callback.apply( this );
		} );
	}
}

export default Collapse;
