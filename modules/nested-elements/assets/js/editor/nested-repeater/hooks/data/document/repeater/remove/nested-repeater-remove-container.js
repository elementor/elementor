import Base from '../../../base';

/**
 * Hook responsible for removing container element for the removed repeater item.
 */
export class NestedRepeaterRemoveContainer extends Base {
	getId() {
		return 'nested-elements-remove-container';
	}

	getCommand() {
		return 'document/repeater/remove';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const childView = container.view.children.findByIndex( args.index );

			$e.run( 'document/elements/delete', {
				container: childView.getContainer(),
			} );
		} );
	}
}

export default NestedRepeaterRemoveContainer;
