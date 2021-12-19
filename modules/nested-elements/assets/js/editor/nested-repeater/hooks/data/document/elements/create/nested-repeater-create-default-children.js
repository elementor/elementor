/**
 * On each nested widget creation.
 *
 * a. Create default children from model config.
 * b. For each nested repeater container set the container title,
 * according to the nested repeater title, the result will be 'Tab #1', 'Tab #2' and so on instead of 'Container'.
 * '_title' is used by the navigator.
 *
 * TODO: Hook actually data changing hook, but since its required to be executed on history change, hookUI is used.
 */
export class NestedRepeaterCreateDefaultChildren extends ( $e.modules.hookUI.After ) {
	getId() {
		return 'nested-repeater-create-default-children';
	}

	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args ) {
		const { model } = args;

		return 'widget' === model.elType && elementor.modules.nestedElements.isWidgetSupportNesting( model.widgetType );
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

		this.createDefaultChildren( containers );
		this.setChildrenTitles( containers );
	}

	createDefaultChildren( containers ) {
		containers.forEach( ( container ) => {
			container.view.createDefaultChildren();
		} );
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
