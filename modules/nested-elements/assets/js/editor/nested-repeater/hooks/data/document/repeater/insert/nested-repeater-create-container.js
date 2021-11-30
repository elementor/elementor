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
				} ),
				repeater = container.repeaters[ args.name ];

			$e.internal( 'document/elements/set-settings', {
				container: newContainer,
				settings: {
					// TODO: Find better solution for dynamic `_title` handling.
					_title: sprintf( __( 'Tab #%d', 'elementor' ), repeater.children.length ),
				},
			} );
		} );
	}
}

export default NestedRepeaterCreateContainer;
