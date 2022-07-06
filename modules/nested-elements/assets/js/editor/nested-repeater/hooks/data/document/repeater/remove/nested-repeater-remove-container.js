import Base from '../../../base';
import { findChildContainerOrFail } from 'elementor/modules/nested-elements/assets/js/editor/utils';

/**
 * Hook responsible for removing container element for the removed repeater item.
 */
export class NestedRepeaterRemoveContainer extends Base {
	getId() {
		return 'document/repeater/remove--nested-elements-remove-container';
	}

	getCommand() {
		return 'document/repeater/remove';
	}

	getConditions( args ) {
		// Will only handle when command called directly and not through another command like `duplicate` or `move`.
		const isCommandCalledDirectly = $e.commands.isCurrentFirstTrace( this.getCommand() );

		return super.getConditions( args ) && isCommandCalledDirectly;
	}

	apply( { container, index } ) {
		$e.run( 'document/elements/delete', {
			container: findChildContainerOrFail( container, index ),
			force: true,
		} );
	}
}

export default NestedRepeaterRemoveContainer;
