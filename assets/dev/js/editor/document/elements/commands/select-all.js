export class SelectAll extends $e.modules.CommandBase {
	apply() {
		const currentDocumentId = elementor.documents.getCurrentId();

		const elementsIds = Object
			.keys( $e.store.getState( 'document/elements' )[ currentDocumentId ] || {} )
			.filter( ( elementId ) => elementId !== 'document' );

		$e.store.dispatch(
			this.component.store( 'selection' ).actions.select( {
				elementsIds,
			} ),
		);
	}

	/**
	 * Recursively iterate over all container children and make a flatten array of their instances.
	 *
	 * @param {*} containers
	 * @return {*[]} flattened array of container children
	 */
	flattenContainersList( containers = [] ) {
		let flatten = [];

		for ( const container of containers ) {
			flatten.push( container );

			if ( container.children.length ) {
				flatten = flatten.concat( this.flattenContainersList( container.children ) );
			}
		}

		return flatten;
	}
}

export default SelectAll;
