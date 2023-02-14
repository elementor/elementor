import Base from '../../../base';

export class NestedRepeaterDuplicateContainer extends Base {
	getId() {
		return 'document/repeater/duplicate--nested-repeater-duplicate-container';
	}

	getCommand() {
		return 'document/repeater/duplicate';
	}

	apply( { container, options } ) {
		if ( ! options.containerModelCid ) {
			return;
		}

		$e.run( 'document/elements/duplicate', {
			container: container.view.children.findByModelCid( options.containerModelCid ).getContainer(),
			options: {
				edit: false, // Not losing focus.
			},
		} );

		container.render();
	}
}

export default NestedRepeaterDuplicateContainer;
