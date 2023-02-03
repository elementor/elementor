import After from 'elementor-api/modules/hooks/ui/after';

export class CreateSectionIsFull extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-section-is-full';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /* Container */ container ) =>
			'section' === container.model.get( 'elType' ),
		);
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'section' === container.model.get( 'elType' ) ) {
				container.view.toggleSectionIsFull();
			}
		} );
	}
}

export default CreateSectionIsFull;
