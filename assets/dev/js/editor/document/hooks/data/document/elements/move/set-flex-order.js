import Dependency from 'elementor-api/modules/hooks/data/dependency';

export class SetFlexOrder extends Dependency {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'set-flex-order--document/elements/move';
	}

	getConditions( args ) {
		const { target } = args;

		// Fire the hook only when the target is a swappable element.
		return ! ! target.view.getSortableOptions()?.swappable;
	}

	apply( args ) {
		const { containers = [ args.container ], target } = args;

		containers.forEach( ( container ) => {
			container.setFlexOrder( args.options?.at );
		} );

		// Don't proceed with the move if it's the same container.
		return containers.some( ( container ) => container.parent.id !== target.id );
	}
}

export default SetFlexOrder;
