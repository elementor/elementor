import After from 'elementor-api/modules/hooks/ui/after';

export class ColumnIsPopulated extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'column-is-populated';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		// If the created element, was created at column.
		return containers.some( ( /**Container*/ container ) => (
			'column' === container.model.get( 'elType' )
		) );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'column' === container.model.get( 'elType' ) ) {
				container.view.changeChildContainerClasses();
				container.view.moveResizeHandle();
			}
		} );
	}
}

export default ColumnIsPopulated;
