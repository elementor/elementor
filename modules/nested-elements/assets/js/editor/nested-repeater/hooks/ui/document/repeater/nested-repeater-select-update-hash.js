/**
 * Each `document/repeater/select` any element, if the ancestry contains nested-widget then set the path to element
 * into HASH URL.
 */
export class NestedRepeaterSelectUpdateHash extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/repeater/select';
	}

	getId() {
		return 'nested-repeater-select-update-hash';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return this.isAncestorsContainsNestedWidget( containers );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		this.setCurrentLocationHash( containers, args.index - 1 );
	}

	isAncestorsContainsNestedWidget( containers ) {
		return containers.some( ( container ) =>
			container.getParentAncestry().some(
				( ancestor ) => $e.components.get( 'nested-elements' )
					.isWidgetSupportNesting( ancestor.model.get( 'widgetType' ) )
			)
		);
	}

	/**
	 * @param {Container[]} containers
	 * @param {number} index
	 */
	setCurrentLocationHash( containers, index ) {
		let ids = '';

		containers.forEach( ( container ) => {
			if ( this.isAncestorsContainsNestedWidget( [ container ] ) ) {
				ids += container.children[ index ].id + ',';
			}
		} );

		if ( ids ) {
			ids = ids.slice( 0, -1 ); // Remove last comma.

			location.hash = `e:run:panel/editor/open?{"ids":"${ ids }"}`;
		}
	}
}

export default NestedRepeaterSelectUpdateHash;
