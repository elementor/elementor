export class ToggleSelection extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], append = false } = args;

		// TODO: Use select/deselect commands?
		$e.store.dispatch(
			this.component.store( 'selection' ).actions.toggleSelection( {
				elementsIds: containers.map( ( container ) => container.id ),
				append,
			} ),
		);
	}

	static reducer( state, { payload } ) {
		const { elementsIds = [ payload.elementId ], append = false } = payload;

		if ( ! append ) {
			state = [];
		}

		elementsIds.forEach( ( elementId ) => {
			if ( state.includes( elementId ) ) {
				state.splice( state.indexOf( elementId ), 1 );
			} else {
				state.push( elementId );
			}
		} );

		return state;
	}
}

export default ToggleSelection;
