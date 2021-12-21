import CommandNavigator from './base/command-navigator';

export class ToggleFolding extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], callback, state } = args;

		containers.forEach( ( container ) => {
			if ( ! container.children.length ) {
				return;
			}

			const isActive = ( ( _state ) => _state[ 'document/elements/folding' ][ container.id ] )(
				$e.store.getState()
			);

			if ( isActive === state ) {
				return;
			}

			const newArgs = { container },
				newState = undefined === state ?
					! isActive :
					state;

			if ( callback ) {
				newArgs.callback = callback;
			}

			if ( newState ) {
				$e.run( 'navigator/elements/expand', newArgs );
			} else {
				$e.run( 'navigator/elements/collapse', newArgs );
			}
		} );
	}
}

export default ToggleFolding;
