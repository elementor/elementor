/**
 * Used to open the current container that are selected via navigator,
 * including selected [path] of the nested elements tree.
 * using `nested-elements/select` command for each level in the selected [path].
 * path = filtered navigation map.
 */
const NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT = 300;

export class NestedModulesSelectRationalContainer extends ( $e.modules.hookData.After ) {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'nested-modules-select-rational-container';
	}

	getConditions( args ) {
		const { options = {} } = args;

		if ( ! options.scrollIntoView ) {
			return false;
		}

		const { container } = args.view;

		if ( elementor.modules.nestedElements.isWidgetSupportNesting( container.parent.model.get( 'widgetType' ) ) ) {
			return true;
		}
	}

	apply( args ) {
		const navigateMap = this.getNavigationMapForContainers(
			this.getAllContainerParentsRecursively( args.view.container ).filter(
				( container ) => 'container' === container.type && 'widget' === container.parent.type
			)
		).filter( ( map ) => {
			// Filter out paths that are the same as current.
			return map.index !== map.current;
		} );

		// For each `navigateMap` run `$e.run( 'nested-modules/select' )`.
		navigateMap.forEach( ( { container, index } ) => {
			setTimeout( () => {
				$e.run( 'nested-elements/select', {
					container,
					index: index++,
				} );
			}, NAVIGATION_DEPTH_SENSITIVITY_TIMEOUT * navigateMap.length );
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

	getAllContainerParentsRecursively( container ) {
		const parents = [];

		let currentContainer = container;

		while ( currentContainer.parent ) {
			parents.push( currentContainer );

			currentContainer = currentContainer.parent;
		}

		return parents;
	}
}

export default NestedModulesSelectRationalContainer;

