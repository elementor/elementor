import Base from '../base';

/**
 * Hook responsible for creating container element for the new created repeater item, and setting the `_title` setting.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args ) {
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
				} );

			$e.components.get( 'nested-elements/nested-repeater' ).setChildrenTitle(
				newContainer,
				container.repeaters[ args.name ].children.length,
			);
		} );
	}
}

export default NestedRepeaterCreateContainer;
