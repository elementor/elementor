import Base from '../../../base';
import { findChildContainerOrFaild } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export class NestedRepeaterMoveContainer extends Base {
	getId() {
		return 'nested-repeater-move-container';
	}

	getCommand() {
		return 'document/repeater/move';
	}

	apply( { container, sourceIndex, targetIndex } ) {
		$e.run( 'document/elements/move', {
			container: findChildContainerOrFaild( container, sourceIndex ),
			target: container,
			options: {
				at: targetIndex,
				edit: false, // Not losing focus.
			},
		} );
	}
}

export default NestedRepeaterMoveContainer;
