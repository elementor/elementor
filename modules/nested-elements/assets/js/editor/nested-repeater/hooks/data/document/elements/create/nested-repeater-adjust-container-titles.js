import Base from '../../../base';

/**
 * On each container that created in nested widget, adjust the title
 * according backend configuration, e.g: the _title will be 'Tab #1', 'Tab #2' and so on instead of 'Container'.
 * '_title' is used by the navigator.
 */
export class NestedRepeaterAdjustContainerTitles extends Base {
	getId() {
		return 'nested-repeater-adjust-container-titles';
	}

	getCommand() {
		return 'document/elements/create';
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

				$e.internal( 'document/elements/set-settings', {
					container,
					settings: {
						_title: this.getChildrenTitle( container.parent, index ),
					},
					options: {
						render: false,
						external: true,
					},
				} );
			} );
		} );
	}
}
