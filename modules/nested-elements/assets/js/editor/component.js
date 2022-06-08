import NestedRepeaterComponent from './nested-repeater/component';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements';
	}

	registerAPI() {
		$e.components.register( new NestedRepeaterComponent() );

		super.registerAPI();
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
}
