import Base from '../../../base';

/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting `_title` for the new container.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args,
			component = $e.components.get( 'nested-elements/nested-repeater' );

		containers.forEach( ( container ) => {
			const index = container.repeaters[ args.name ].children.length;

			$e.run( 'document/elements/create', {
				container,
				model: {
					elType: 'container',
					_title: component.getChildrenTitle( container, index ),
				},
				options: {
					edit: false, // Not losing focus.
				},
			} );
		} );
	}
}

export default NestedRepeaterCreateContainer;
