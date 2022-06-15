import Base from '../../../base';

/**
 * Hook responsible for:
 * a. Create container element for each created repeater item.
 * b. Set setting `_title` for the new container.
 * c. Since the core mechanism does not support nested by default,
 *    the hook take care of duplicating the children for the new container.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args,
			component = $e.components.get( 'nested-elements/nested-repeater' );

		containers.forEach( ( container ) => {
			const index = container.repeaters[ args.name ].children.length,
				optionsExtras = {},
				modelExtras = {};

			if ( $e.commands.isCurrentFirstTrace( 'document/repeater/duplicate' ) ) {
				const at = $e.commands.currentArgs.document.options.at - 1,
					duplicatedContainer = container.children[ at ],
					removeIdCallback = ( element ) => {
						delete element.id;

						// Duplicate should generate new ID for the element(s).
						if ( element.elements ) {
							element.elements = element.elements.map( removeIdCallback );
						}

						return element;
					};

				// Remove id from elements recursively.
				modelExtras.elements = duplicatedContainer.model.toJSON().elements.map(
					( element ) => removeIdCallback( element )
				);

				modelExtras._title = duplicatedContainer.model.getSetting( '_title' );

				optionsExtras.at = at + 1;
			}

			$e.run( 'document/elements/create', {
				container,
				model: {
					... modelExtras,
					elType: 'container',
					_title: modelExtras._title || component.getChildrenTitle( container, index ),
				},
				options: {
					... optionsExtras,
					edit: false, // Not losing focus.
				},
			} );
		} );
	}
}

export default NestedRepeaterCreateContainer;
