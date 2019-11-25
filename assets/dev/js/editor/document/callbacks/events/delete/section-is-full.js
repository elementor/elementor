import HookAfter from '../base/after';

export class DeleteSectionIsFull extends HookAfter {
	command() {
		return 'document/elements/delete';
	}

	id() {
		return 'delete-section-is-full';
	}

	conditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /* Container */ container ) =>
			'column' === container.model.get( 'elType' )
		);
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'column' === container.model.get( 'elType' ) ) {
				container.parent.view._checkIsFull();
			}
		} );
	}
}

export default DeleteSectionIsFull;
