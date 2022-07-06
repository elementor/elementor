import { isWidgetSupportNesting } from 'elementor/modules/nested-elements/assets/js/editor/utils';

/**
 * Since the nested tabs can have different depths, it should focus the current edited container,
 * but the problem is, without timeout it will be so fast, that the USER will not be able to see it.
 * using `NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT` it will be delayed. formula: `NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT * depth`.
 */
const NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT = 250;

/**
 * Used to open current selected container.
 * Will run 'document/repeater/select', over nested elements tree.
 * Will select all repeater nested item(s) till it reach current repeater of selected element.
 */
export class NestedRepeaterFocusCurrentEditedContainer extends ( $e.modules.hookUI.After ) {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'nested-repeater-focus-current-edited-container';
	}

	getConditions( args ) {
		// Do not select for element creation.
		if ( $e.commands.isCurrentFirstTrace( 'document/elements/create' ) ) {
			return false;
		}

		// If some of the parents are supporting nested elements, then return true.
		const allParents = args.view.container.getParentAncestry(),
			result = allParents.some( ( parent ) =>
				isWidgetSupportNesting( parent.model.get( 'widgetType' ) ),
			);

		if ( result ) {
			this.navigationMap = this.getNavigationMapForContainers( allParents.filter(
				( container ) => 'container' === container.type && 'widget' === container.parent.type,
			) ).filter( ( map ) => {
				// Filter out paths that are the same as current.
				return map.index !== map.current;
			} );
		}

		return this.navigationMap?.length;
	}

	apply() {
		let depth = 1;

		this.navigationMap.forEach( ( { container, index } ) => {
			setTimeout( () => {
				// No history, for focusing on current container.
				$e.run( 'document/repeater/select', {
					container,
					index: index++,
					options: {
						useHistory: false,
					},
				} );
			}, NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT * depth );

			++depth;
        } );
	}

	getNavigationMapForContainers( containers ) {
		return containers.map( ( container ) => {
			return {
				current: container.parent.model.get( 'editSettings' ).get( 'activeItemIndex' ),
				container: container.parent,
				index: container.parent.children.indexOf( container ) + 1,
			};
		} ).reverse();
	}
}

export default NestedRepeaterFocusCurrentEditedContainer;

