import EventAfter from 'elementor-api/modules/event-base/after';

export class DeleteSectionIsFull extends EventAfter {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'delete-section-is-full';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /* Container */ container ) =>
			'column' === container.model.get( 'elType' )
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
