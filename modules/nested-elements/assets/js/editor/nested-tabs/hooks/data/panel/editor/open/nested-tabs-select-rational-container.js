/**
 * Used to open the current container that are selected via navigator,
 * including selected [path] of the nested elements tree.
 * using `nested-elements/nested-tabs/select` command for each level in the selected [path].
 * path = filtered navigation map.
 */
const NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT = 250;

export class NestedTabsSelectRationalContainer extends ( $e.modules.hookData.After ) {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'nested-elements-select-rational-container';
	}

	getConditions( args ) {
		const { options = {} } = args;

		if ( ! options.scrollIntoView ) {
			return false;
		}

		// If some of the parents are supporting nested elements, then return true.
		const allParents = args.view.container.getParentAncestry(),
			result = allParents.some( ( parent ) =>
				elementor.modules.nestedElements.isWidgetSupportNesting( parent.model.get( 'widgetType' ) )
			);

		if ( result ) {
			this.allParents = allParents;
		}

		return result;
	}

	apply() {
		const navigateMap = this.getNavigationMapForContainers( this.allParents.filter(
				( container ) => 'container' === container.type && 'widget' === container.parent.type
			) ).filter( ( map ) => {
			// Filter out paths that are the same as current.
			return map.index !== map.current;
		} );

		let depth = 1;

		// For each `navigateMap` run `$e.run( 'nested-modules/select' )`.
		navigateMap.forEach( ( { container, index } ) => {
			setTimeout( () => {
				$e.run( 'nested-elements/nested-tabs/select', {
					container,
					index: index++,
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

export default NestedTabsSelectRationalContainer;

