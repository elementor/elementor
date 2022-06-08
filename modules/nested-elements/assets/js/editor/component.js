import NestedRepeaterComponent from './nested-repeater/component';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	registerAPI() {
		$e.components.register( new NestedRepeaterComponent() );

		super.registerAPI();

		elementor.hooks.addFilter( 'elements/container/contextMenuGroups', this.removeDeleteFromContextMenu.bind( this ) );
	}

	isWidgetSupportNesting( widgetType ) {
		// eslint-disable-next-line camelcase
		return elementor.widgetsCache[ widgetType ]?.support_nesting;
	}

	isModelParentSupportNesting( model ) {
		// Find parent of specific children by given id.
		const findParentRecursive = ( elements, id ) => {
				for ( const element of elements ) {
					const recursive = ( subElement ) => {
						for ( const current of subElement.elements ) {
							if ( current.id === id ) {
								return subElement;
							}

							if ( current.elements ) {
								const result = recursive( current );

								if ( result ) {
									return result;
								}
							}
						}
					};

					const result = recursive( element );

					if ( result ) {
						return result;
					}
				}
			},
			parent = findParentRecursive( elementor.elements.toJSON(), model.get( 'id' ) );

		return this.isWidgetSupportNesting( parent?.widgetType );
	}

	removeDeleteFromContextMenu( groups, view ) {
		// Disabling 'delete' from context menu of building blocks containers.
		const model = view.options.model;

		if ( 'container' === model.get( 'elType' ) &&
			this.isModelParentSupportNesting( model ) ) {
			// Remove the 'delete' item from the container context menu.
			const newValues = [ ... groups ],
				deleteItemIndex = newValues.findIndex( ( item ) => 'delete' === item?.name );

			delete newValues[ deleteItemIndex ];

			groups = newValues;
		}

		return groups;
	}
}
