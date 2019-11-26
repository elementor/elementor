import EventAfter from '../base/after';

export class ColumnIsPopulated extends EventAfter {
	command() {
		return 'document/elements/create';
	}

	id() {
		return 'column-is-populated';
	}

	conditions( args ) {
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
			}
		} );
	}
}

export default ColumnIsPopulated;
