import Base from '../base';

/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting `_title` for the new container.
 * c. Update `title` for new created repeater item.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args, createdRepeaterItemModel ) {
		const { containers = [ args.container ] } = args,
			component = $e.components.get( 'nested-elements/nested-repeater' );

		containers.forEach( ( container ) => {
			const newContainer = $e.run( 'document/elements/create', {
					container,
					model: {
						elType: 'container',
					},
					options: {
						edit: false, // Not losing focus.
					},
				} ),
				newRepeaterItemContainer = newContainer.parent.repeaters[ args.name ].children.find(
					( item ) => item.id === createdRepeaterItemModel.get( '_id' )
				),
				index = container.repeaters[ args.name ].children.length;

			// Update the `_title` setting.
			component.setChildrenTitle( newContainer, index );
			// Update repeater item title.
			component.setRepeaterItemTitle( newRepeaterItemContainer, index );
		} );
	}
}

export default NestedRepeaterCreateContainer;
