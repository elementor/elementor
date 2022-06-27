import Base from '../../../base';
import { findChildContainerOrFaild } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export class NestedRepeaterDuplicateContainer extends Base {
	getId() {
		return 'nested-repeater-duplicate-container';
	}

	getCommand() {
		return 'document/repeater/duplicate';
	}

	apply( { container, index } ) {
		$e.run( 'document/elements/duplicate', {
			container: findChildContainerOrFaild( container, index ),
			options: {
				edit: false, // Not losing focus.
			},
		} );
	}
}

export default NestedRepeaterDuplicateContainer;
