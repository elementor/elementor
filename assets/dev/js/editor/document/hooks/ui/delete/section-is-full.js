import After from 'elementor-api/modules/hooks/ui/after';

export class DeleteSectionIsFull extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'delete-section-is-full';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /* Container */ container ) =>
			'column' === container.model.get( 'elType' ),
		);
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'column' === container.model.get( 'elType' ) ) {
				container.parent.view.toggleSectionIsFull();
			}
		} );
	}
}

export default DeleteSectionIsFull;
