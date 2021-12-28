import CommandNavigator from './base/command-navigator';

export class Collapse extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			$e.store.dispatch(
				$e.store.get( 'navigator/folding' ).actions.toggle( {
					elementId: container.id,
					state: false,
				} )
			);

			if ( callback ) {
				callback.apply( this );
			}
		} );
	}
}

export default Collapse;
