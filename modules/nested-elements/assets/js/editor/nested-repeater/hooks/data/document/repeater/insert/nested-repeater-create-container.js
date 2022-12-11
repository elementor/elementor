import Base from '../../../base';
import { extractNestedItemTitle } from 'elementor/modules/nested-elements/assets/js/editor/utils';

/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting `_title` for the new container.
 * c. Since the core mechanism does not support nested by default,
 *    the hook take care of duplicating the children for the new container.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'document/repeater/insert--nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	getConditions( args ) {
		// Will only handle when command called directly and not through another command like `duplicate` or `move`.
		const isCommandCalledDirectly = $e.commands.isCurrentFirstTrace( this.getCommand() );

		return super.getConditions( args ) && isCommandCalledDirectly;
	}

	apply( { container, name } ) {
		const index = container.repeaters[ name ].children.length;

		$e.run( 'document/elements/create', {
			container,
			model: {
				elType: 'container',
				isLocked: true,
				_title: extractNestedItemTitle( container, index ),
			},
			options: {
				edit: false, // Not losing focus.
			},
		} );
	}
}

export default NestedRepeaterCreateContainer;
