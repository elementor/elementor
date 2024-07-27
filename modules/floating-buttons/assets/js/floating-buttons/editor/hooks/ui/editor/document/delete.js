import After from 'elementor-api/modules/hooks/ui/after';

export class DeleteParentIfWidget extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'delete-parent-if-widget';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /** Container*/ container ) => (
			'floating-buttons' === container?.document?.config?.type && 'widget' === container.model.get( 'elType' )
		) );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;
		const [ firstContainer ] = containers;

		if ( ! firstContainer ) {
			return;
		}

		const { parent } = firstContainer;

		if ( ! parent ) {
			return;
		}

		$e.run( 'document/elements/delete', { container: parent } );
	}
}

export default DeleteParentIfWidget;
