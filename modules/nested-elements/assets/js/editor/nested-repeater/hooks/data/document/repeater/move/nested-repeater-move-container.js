import Base from '../../../base';
import { findChildContainerOrFail } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export class NestedRepeaterMoveContainer extends Base {
	getId() {
		return 'document/repeater/move--nested-repeater-move-container';
	}

	getCommand() {
		return 'document/repeater/move';
	}

	apply( { container, sourceIndex, targetIndex, options } ) {
		const containerModelCid = this.getRepeaterItemContainerModelCidIfExists(
			container,
			sourceIndex,
			'',
			''
		);

		$e.run( 'document/elements/move', {
			//container: findChildContainerOrFail( container, sourceIndex, options.containerModelCid ),
			container: findChildContainerOrFail( container, sourceIndex, containerModelCid ),
			target: container,
			options: {
				at: targetIndex,
				edit: false, // Not losing focus.
			},
		} );
	}

	// Have to re-search the model cid.
	getRepeaterItemContainerModelCidIfExists( container, index, attribute_path, control_key ) {
		//if ( this.itemDoesNotNeedChildContainer( attribute_path, control_key ) ) {
			//return false;
		//}

		const contentIndex = index;
		const childContainer = container.children.find( ( child ) => +child.view.el.dataset.content === contentIndex );

		if ( ! childContainer ) {
			return false;
		}

		return childContainer.model.cid;
	}
}

export default NestedRepeaterMoveContainer;