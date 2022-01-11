/**
 * On each nested widget creation.
 *
 * For each nested repeater container, set the container title,
 * according to the nested repeater title, e.g: the result will be 'Tab #1', 'Tab #2' and so on instead of 'Container'.
 * '_title' is used by the navigator.
 */
export class NestedRepeaterAdjustContainerTitles extends ( $e.modules.hookData.After ) {
	getId() {
		return 'nested-repeater-adjust-container-titles';
	}

	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args ) {
		const { model } = args;

		return 'widget' === model.elType && $e.components.get( 'nested-elements' ).isWidgetSupportNesting( model.widgetType );
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Container[]|Container} containers
	 *
	 * @returns {boolean}
	 */
	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		this.setChildrenTitles( containers );
	}

	setChildrenTitles( containers ) {
		containers.forEach( ( container ) => {
			if ( ! container?.children ) {
				return;
			}

			container.children.forEach( ( childContainer ) => {
				// Set container tab title according to its repeater item name.
				const index = childContainer.parent.children.indexOf( childContainer ) + 1;

				$e.components.get( 'nested-elements/nested-repeater' ).setChildrenTitle(
					childContainer,
					index,
				);
			} );
		} );
	}
}
