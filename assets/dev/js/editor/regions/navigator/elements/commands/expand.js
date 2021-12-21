import CommandNavigator from './base/command-navigator';

export class Expand extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			$e.store.dispatch(
				$e.store.get( 'document/elements/folding' ).actions.toggle( {
					containerId: container.id,
					state: true,
				} )
			);

			callback.apply( this );
		} );
	}
}

export default Expand;
