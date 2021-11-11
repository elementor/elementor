export class NestedTabsAdjustContainerTittles extends ( $e.modules.hookData.After ) {
	getId() {
		return 'nested-tabs-adjust-container-tittles';
	}

	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args = {} ) {
		const { model } = args;

		return 'widget' === model.elType && 'nested-tabs' === model.widgetType;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Container[]} containers
	 *
	 * @returns {boolean}
	 */
	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		containers.forEach( ( container ) => {
			container.children.forEach( ( childContainer ) => {
				// Set container tab title according to its repeater item name.
				const index = childContainer.parent.children.indexOf( childContainer ),
					repeaterItem = childContainer.parent.repeaters[ args.model.widgetType ].children[ index ],
					title = repeaterItem.settings.get( 'tab_title' ),
					eContainer = childContainer.parent.children[ index ];

				eContainer.settings.set( '_title', title );
			} );
		} );
	}
}
