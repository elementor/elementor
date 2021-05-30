import { After } from 'elementor-api/modules/hooks/data';

export class SetFlexOrder extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'set-flex-order--document/elements/delete';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		// Fire the hook only when the parent is a swappable element.
		return containers.some( ( /* Container */ container ) =>
			container.parent.view.getSortableOptions()?.swappable
		);
	}

	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		containers.forEach( ( /* Container */ container ) => {
			const flexItems = container.view.sortFlexItemsArray( container.parent.children );

			flexItems.forEach( ( item, i ) => {
				item.setFlexOrder( i );
			} );
		} );
	}
}

export default SetFlexOrder;
