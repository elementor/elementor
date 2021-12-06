import Base from '../base';

/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting  `_title` for the new container. 
 * c. Update`title` for new created repeater item.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args, createdRepeaterItemModel ) {
		const { containers = [ args.container ] } = args;

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
				// Update the `_title` setting.
				newTitle = $e.components.get( 'nested-elements/nested-repeater' ).setChildrenTitle(
					newContainer,
					container.repeaters[ args.name ].children.length,
				),
				newRepeaterItemContainer = newContainer.parent.repeaters[ args.name ].children.find(
					( item ) => item.id === createdRepeaterItemModel.get( '_id' )
				);

			// Update repeater item title.
			$e.internal( 'document/elements/set-settings', {
				container: newRepeaterItemContainer,
				settings: {
					tab_title: newTitle,
				},
				options: {
					external: true,
				},
			} );
		} );
	}
}

export default NestedRepeaterCreateContainer;
