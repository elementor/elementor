import EventAfter from '../base/after';

export class ColumnIsEmpty extends EventAfter {
	command() {
		return 'document/elements/delete';
	}

	id() {
		return 'column-is-empty';
	}

	conditions( args ) {
		const { containers = [ args.container ] } = args;

		// If the deleted element, was deleted from column.
		return containers.some( ( /**Container*/ container ) => (
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
