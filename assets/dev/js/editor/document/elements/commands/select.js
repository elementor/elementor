export class Select extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], append = false } = args;

		$e.store.dispatch(
			this.component.store( 'selection' ).actions.select( {
				elementsIds: containers.map( ( container ) => container.id ),
				append,
			} ),
		);

		containers.forEach( ( container ) => container.view.select() );
	}

	static reducer( state, { payload } ) {
		const { append = false, elementsIds = [ payload.elementId ] } = payload;

		if ( ! append ) {
			return elementsIds;
		}

		elementsIds.forEach( ( elementId ) => {
			if ( ! state.includes( elementId ) ) {
				state.push( elementId );
			}
		} );
	}
}

export default Select;
