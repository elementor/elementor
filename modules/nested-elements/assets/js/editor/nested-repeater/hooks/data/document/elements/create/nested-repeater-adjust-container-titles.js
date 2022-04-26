import Base from '../../../base';

/**
 * On each nested widget creation.
 *
 * For each nested repeater container, set the container title,
 * according to the nested repeater title, e.g: the result will be 'Tab #1', 'Tab #2' and so on instead of 'Container'.
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
