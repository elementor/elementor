import CommandNavigator from './base/command-navigator';

export class ToggleFolding extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], state } = args;

		containers.forEach( ( container ) => {
			const isActive = ( ( _state ) => _state[ 'navigator/folding' ][ container.id ] )(
				$e.store.getState()
			);

			if ( isActive === state ) {
				return;
			}

			const newArgs = { container },
				newState = undefined === state ?
					! isActive :
					state;

			if ( newState ) {
				$e.run( 'navigator/elements/expand', newArgs );
			} else {
				$e.run( 'navigator/elements/collapse', newArgs );
			}
		} );
	}
}

export default ToggleFolding;
