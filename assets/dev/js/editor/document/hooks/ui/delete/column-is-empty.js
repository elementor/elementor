import After from 'elementor-api/modules/hooks/ui/after';

export class ColumnIsEmpty extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'column-is-empty';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		// If the deleted element, was deleted from column.
		return containers.some( ( /** Container*/ container ) => (
			'column' === container.parent.model.get( 'elType' )
		) );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'column' === container.parent.model.get( 'elType' ) ) {
				container.parent.view.changeChildContainerClasses();
			}
		} );
	}
}

export default ColumnIsEmpty;
