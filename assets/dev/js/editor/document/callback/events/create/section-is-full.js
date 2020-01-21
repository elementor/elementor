import HookAfter from '../base/after';

export class CreateSectionIsFull extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-section-is-full';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /* Container */ container ) =>
			'section' === container.model.get( 'elType' )
		);
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'section' === container.model.get( 'elType' ) ) {
				container.view._checkIsFull();
			}
		} );
	}
}

export default CreateSectionIsFull;
