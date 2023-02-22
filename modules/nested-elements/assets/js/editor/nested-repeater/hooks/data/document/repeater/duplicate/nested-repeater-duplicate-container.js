import Base from '../../../base';
import { findChildContainerOrFail } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export class NestedRepeaterDuplicateContainer extends Base {
	getId() {
		return 'document/repeater/duplicate--nested-repeater-duplicate-container';
	}

	getCommand() {
		return 'document/repeater/duplicate';
	}

	apply( { container, index, options } ) {
		const childView = findChildContainerOrFail( container, index, options.containerModelCid );

		if ( ! childView ) {
			return;
		}

		$e.run( 'document/elements/duplicate', {
			container: childView,
			options: {
				edit: false, // Not losing focus.
			},
		} );

		container.render();
	}
}

export default NestedRepeaterDuplicateContainer;
