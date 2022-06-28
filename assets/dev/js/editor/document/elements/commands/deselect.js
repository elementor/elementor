export class Deselect extends $e.modules.editor.CommandContainerBase {
	validateArgs( args = {} ) {
		if ( ! args.all ) {
			this.requireContainer( args );
		}
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		$e.store.dispatch(
			this.component.store( 'selection' ).actions.deselect( {
				elementsIds: containers.map( ( container ) => container.id ),
			} ),
		);

		containers.forEach( ( container ) => container.view.deselect() );
	}

	static reducer( state, { payload } ) {
		const { elementsIds = [ payload.elementId ] } = payload;

		return state.filter( ( elementId ) => ! elementsIds.includes( elementId ) );
	}
}

export default Deselect;
