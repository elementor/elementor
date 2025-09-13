export default class AtomicContainer extends elementor.modules.elements.models.Element {
	/**
	 * Do not allow section, column or container be placed in the Atomic container.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		const elType = childModel.get( 'elType' );

		return 'section' !== elType && 'column' !== elType;
	}

	initialize( attributes, options ) {
		const elementType = this.get( 'elType' );
		this.config = elementor.config.elements[ elementType ];

		const isNewElementCreate = 0 === this.get( 'elements' ).length &&
			$e.commands.currentTrace.includes( 'document/elements/create' );

		if ( isNewElementCreate ) {
			this.onElementCreate();
		}

		super.initialize( attributes, options );
	}

	getDefaultChildren() {
		if ( ! this.config?.default_children ) {
			return;
		}
		const { default_children: defaultChildren } = this.config;

		return defaultChildren.map( ( element ) => {
			return {
				elType: element.elType,
				widgetType: element.widgetType,
				id: elementorCommon.helpers.getUniqueId(),
				settings: element.settings || {},
				elements: element.elements || [],
				isLocked: element.isLocked || false,
			};
		} );
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren() );
	}
}
